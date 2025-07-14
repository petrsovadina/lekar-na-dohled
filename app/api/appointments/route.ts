import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAuditLog, validateGDPRCompliance } from '@/lib/gdpr-utils'
import { CzechValidators } from '@/lib/czech-validation'
import type { 
  AppointmentBookingData, 
  Appointment, 
  AppointmentStatus, 
  AppointmentPriority,
  ConsultationType,
  InsuranceProvider 
} from '@/types'

// Supabase client pro server-side operace
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// České zdravotní pojišťovny pro validaci
const CZECH_INSURANCE_PROVIDERS = {
  '111': 'Všeobecná zdravotní pojišťovna České republiky',
  '201': 'Vojenská zdravotní pojišťovna České republiky', 
  '205': 'Česká průmyslová zdravotní pojišťovna',
  '207': 'Oborová zdravotní pojišťovna zaměstnanců bank, pojišťoven a stavebnictví',
  '209': 'Zaměstnanecká pojišťovna Škoda',
  '211': 'Zdravotní pojišťovna ministerstva vnitra České republiky',
  '213': 'Revírní bratrská pokladna, zdravotní pojišťovna'
}

// České svátky pro kontrolu dostupnosti
const CZECH_HOLIDAYS_2024_2025 = [
  '2024-01-01', '2024-04-01', '2024-05-01', '2024-05-08', '2024-07-05', '2024-07-06',
  '2024-09-28', '2024-10-28', '2024-11-17', '2024-12-24', '2024-12-25', '2024-12-26',
  '2025-01-01', '2025-04-21', '2025-05-01', '2025-05-08', '2025-07-05', '2025-07-06',
  '2025-09-28', '2025-10-28', '2025-11-17', '2025-12-24', '2025-12-25', '2025-12-26'
]

// GET - Načtení termínů uživatele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const doctorId = searchParams.get('doctorId')
    const status = searchParams.get('status') as AppointmentStatus
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const includeDetails = searchParams.get('includeDetails') === 'true'

    // Ověření autentizace
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Chybí autentizační token' },
        { status: 401 }
      )
    }

    // Sestavení query
    let query = supabase
      .from('appointments')
      .select(includeDetails ? `
        *,
        doctor:doctors(*),
        patient:user_profiles(*)
      ` : '*')
      .order('appointment_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (userId) {
      query = query.eq('patient_id', userId)
    }

    if (doctorId) {
      query = query.eq('doctor_id', doctorId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Chyba při načítání termínů' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      metadata: {
        total: count || 0,
        offset,
        limit
      }
    })

  } catch (error) {
    console.error('Chyba v GET /api/appointments:', error)
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    )
  }
}

// POST - Vytvoření nového termínu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      doctorId,
      patientId,
      appointmentDate,
      consultationType,
      reason,
      symptoms,
      priority = 'normal',
      notes,
      insurance_verified = false
    } = body as AppointmentBookingData & { 
      patientId?: string,
      insurance_verified?: boolean 
    }

    // Validace vstupních dat
    const validationResult = await validateAppointmentData(body)
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      )
    }

    // Ověření autentizace a získání userId
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Chybí autentizační token' },
        { status: 401 }
      )
    }

    // Extrakce userId z auth tokenu (zjednodušené)
    let userId = patientId
    if (!userId) {
      // Zde by bylo třeba implementovat skutečné ověření JWT tokenu
      return NextResponse.json(
        { error: 'Nepodařilo se identifikovat uživatele' },
        { status: 401 }
      )
    }

    // Kontrola existence lékaře
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', doctorId)
      .single()

    if (doctorError || !doctor) {
      return NextResponse.json(
        { error: 'Lékař nebyl nalezen' },
        { status: 404 }
      )
    }

    // Kontrola dostupnosti lékaře
    const availabilityCheck = await checkDoctorAvailability(
      doctorId, 
      appointmentDate, 
      consultationType
    )
    
    if (!availabilityCheck.available) {
      return NextResponse.json(
        { error: availabilityCheck.reason },
        { status: 400 }
      )
    }

    // Kontrola pojištění
    const insuranceCheck = await verifyInsurance(userId, doctor.accepted_insurances)
    
    // Vytvoření termínu
    const appointmentData = {
      doctor_id: doctorId,
      patient_id: userId,
      appointment_date: appointmentDate,
      duration_minutes: getConsultationDuration(consultationType),
      consultation_type: consultationType,
      status: 'scheduled' as AppointmentStatus,
      priority: priority as AppointmentPriority,
      reason,
      symptoms: symptoms ? (Array.isArray(symptoms) ? symptoms : [symptoms]) : null,
      notes,
      insurance_verified: insuranceCheck.verified,
      payment_status: insuranceCheck.verified ? 'paid' : 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select('*')
      .single()

    if (appointmentError) {
      return NextResponse.json(
        { error: 'Chyba při vytváření termínu' },
        { status: 500 }
      )
    }

    // Aktualizace dostupnosti lékaře
    await updateDoctorAvailability(doctorId, appointmentDate, appointment.id)

    // Vytvoření audit logu
    const auditLog = createAuditLog(
      'create',
      'appointment',
      `Vytvořen termín pro pacienta ${userId} k lékaři ${doctorId}`,
      userId
    )
    
    await supabase.from('audit_logs').insert([auditLog])

    // Odeslání emailového potvrzení
    await sendAppointmentConfirmation(appointment, doctor, userId)

    // Generování telemedicine linku pokud je potřeba
    let telemedicineLink = null
    if (consultationType === 'telemedicine') {
      telemedicineLink = await generateTelemedicineLink(appointment.id)
      
      // Aktualizace termínu s linkem
      await supabase
        .from('appointments')
        .update({ telemedicine_link: telemedicineLink })
        .eq('id', appointment.id)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...appointment,
        telemedicine_link: telemedicineLink
      },
      insurance_status: {
        verified: insuranceCheck.verified,
        provider: insuranceCheck.provider,
        message: insuranceCheck.message
      }
    })

  } catch (error) {
    console.error('Chyba při vytváření termínu:', error)
    return NextResponse.json(
      { error: 'Neočekávaná chyba při vytváření termínu' },
      { status: 500 }
    )
  }
}

// PUT - Aktualizace termínu
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId, status, notes, diagnosis, prescription } = body

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID termínu je povinné' },
        { status: 400 }
      )
    }

    // Ověření existence termínu
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Termín nebyl nalezen' },
        { status: 404 }
      )
    }

    // Příprava dat pro aktualizaci
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status) updateData.status = status
    if (notes) updateData.notes = notes
    if (diagnosis) updateData.diagnosis = diagnosis
    if (prescription) updateData.prescription = prescription

    // Aktualizace termínu
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select('*')
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Chyba při aktualizaci termínu' },
        { status: 500 }
      )
    }

    // Audit log
    const auditLog = createAuditLog(
      'update',
      'appointment',
      `Aktualizován termín ${appointmentId}`,
      appointment.patient_id
    )
    
    await supabase.from('audit_logs').insert([auditLog])

    return NextResponse.json({
      success: true,
      data: updatedAppointment
    })

  } catch (error) {
    console.error('Chyba při aktualizaci termínu:', error)
    return NextResponse.json(
      { error: 'Neočekávaná chyba při aktualizaci' },
      { status: 500 }
    )
  }
}

// DELETE - Zrušení termínu
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')
    const reason = searchParams.get('reason') || 'Zrušeno uživatelem'

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID termínu je povinné' },
        { status: 400 }
      )
    }

    // Ověření existence termínu
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Termín nebyl nalezen' },
        { status: 404 }
      )
    }

    // Kontrola, zda lze termín zrušit
    const appointmentDate = new Date(appointment.appointment_date)
    const now = new Date()
    const hoursDifference = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursDifference < 24 && appointment.priority !== 'emergency') {
      return NextResponse.json(
        { error: 'Termín lze zrušit pouze 24 hodin předem' },
        { status: 400 }
      )
    }

    // Aktualizace statusu na cancelled
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        notes: (appointment.notes || '') + `\nZrušeno: ${reason}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Chyba při rušení termínu' },
        { status: 500 }
      )
    }

    // Uvolnění dostupnosti lékaře
    await releaseDoctorAvailability(appointment.doctor_id, appointment.appointment_date)

    // Audit log
    const auditLog = createAuditLog(
      'delete',
      'appointment',
      `Zrušen termín ${appointmentId}: ${reason}`,
      appointment.patient_id
    )
    
    await supabase.from('audit_logs').insert([auditLog])

    // Odeslání emailu o zrušení
    await sendCancellationNotification(appointment, reason)

    return NextResponse.json({
      success: true,
      message: 'Termín byl úspěšně zrušen'
    })

  } catch (error) {
    console.error('Chyba při rušení termínu:', error)
    return NextResponse.json(
      { error: 'Neočekávaná chyba při rušení termínu' },
      { status: 500 }
    )
  }
}

// Pomocné funkce

async function validateAppointmentData(data: any) {
  const errors: string[] = []

  if (!data.doctorId) errors.push('ID lékaře je povinné')
  if (!data.appointmentDate) errors.push('Datum termínu je povinný')
  if (!data.consultationType) errors.push('Typ konzultace je povinný')
  if (!data.reason || data.reason.trim().length < 10) {
    errors.push('Důvod návštěvy musí mít alespoň 10 znaků')
  }

  // Validace data termínu
  const appointmentDate = new Date(data.appointmentDate)
  const now = new Date()
  
  if (appointmentDate <= now) {
    errors.push('Termín musí být v budoucnosti')
  }

  // Kontrola českých svátků
  const dateStr = appointmentDate.toISOString().split('T')[0]
  if (CZECH_HOLIDAYS_2024_2025.includes(dateStr)) {
    errors.push('Termín nelze rezervovat na státní svátek')
  }

  // Kontrola pracovní doby (8:00 - 18:00)
  const hour = appointmentDate.getHours()
  if (hour < 8 || hour >= 18) {
    errors.push('Termín musí být v pracovní době (8:00 - 18:00)')
  }

  // Kontrola víkendu
  const dayOfWeek = appointmentDate.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    errors.push('Termín nelze rezervovat na víkend')
  }

  return {
    isValid: errors.length === 0,
    error: errors.join(', ')
  }
}

async function checkDoctorAvailability(
  doctorId: string, 
  appointmentDate: string, 
  consultationType: ConsultationType
) {
  const date = new Date(appointmentDate)
  const dateStr = date.toISOString().split('T')[0]
  const timeStr = date.toTimeString().substring(0, 5)

  // Kontrola dostupnosti v databázi
  const { data: availability } = await supabase
    .from('doctor_availability')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('date', dateStr)
    .single()

  if (!availability || !availability.is_available) {
    return {
      available: false,
      reason: 'Lékař není v tento den dostupný'
    }
  }

  // Kontrola časových slotů
  const timeSlots = availability.time_slots || []
  const availableSlot = timeSlots.find((slot: any) => 
    slot.start_time <= timeStr && 
    slot.end_time > timeStr && 
    !slot.is_booked
  )

  if (!availableSlot) {
    return {
      available: false,
      reason: 'V tento čas není dostupný termín'
    }
  }

  // Kontrola typu konzultace
  const { data: doctor } = await supabase
    .from('doctors')
    .select('consultation_types')
    .eq('id', doctorId)
    .single()

  if (!doctor?.consultation_types.includes(consultationType)) {
    return {
      available: false,
      reason: 'Lékař neposkytuje tento typ konzultace'
    }
  }

  return { available: true }
}

async function verifyInsurance(userId: string, acceptedInsurances: InsuranceProvider[]) {
  // Získání údajů o pojištění uživatele
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('insurance_provider')
    .eq('user_id', userId)
    .single()

  if (!userProfile?.insurance_provider) {
    return {
      verified: false,
      provider: null,
      message: 'Údaje o pojištění nejsou k dispozici'
    }
  }

  const userInsurance = userProfile.insurance_provider as InsuranceProvider
  const isAccepted = acceptedInsurances.includes(userInsurance)

  return {
    verified: isAccepted,
    provider: CZECH_INSURANCE_PROVIDERS[userInsurance],
    message: isAccepted 
      ? 'Pojištění je akceptováno'
      : 'Pojišťovna není v seznamu akceptovaných pojišťoven'
  }
}

function getConsultationDuration(type: ConsultationType): number {
  const durations = {
    'in-person': 30,
    'telemedicine': 20,
    'phone': 15,
    'chat': 10
  }
  return durations[type] || 30
}

async function updateDoctorAvailability(
  doctorId: string, 
  appointmentDate: string, 
  appointmentId: string
) {
  const date = new Date(appointmentDate)
  const dateStr = date.toISOString().split('T')[0]
  const timeStr = date.toTimeString().substring(0, 5)

  // Aktualizace time_slots v dostupnosti
  const { data: availability } = await supabase
    .from('doctor_availability')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('date', dateStr)
    .single()

  if (availability) {
    const timeSlots = availability.time_slots.map((slot: any) => {
      if (slot.start_time <= timeStr && slot.end_time > timeStr) {
        return {
          ...slot,
          is_booked: true,
          appointment_id: appointmentId
        }
      }
      return slot
    })

    await supabase
      .from('doctor_availability')
      .update({ time_slots: timeSlots })
      .eq('id', availability.id)
  }
}

async function releaseDoctorAvailability(doctorId: string, appointmentDate: string) {
  const date = new Date(appointmentDate)
  const dateStr = date.toISOString().split('T')[0]
  const timeStr = date.toTimeString().substring(0, 5)

  const { data: availability } = await supabase
    .from('doctor_availability')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('date', dateStr)
    .single()

  if (availability) {
    const timeSlots = availability.time_slots.map((slot: any) => {
      if (slot.start_time <= timeStr && slot.end_time > timeStr) {
        return {
          ...slot,
          is_booked: false,
          appointment_id: null
        }
      }
      return slot
    })

    await supabase
      .from('doctor_availability')
      .update({ time_slots: timeSlots })
      .eq('id', availability.id)
  }
}

async function generateTelemedicineLink(appointmentId: string): Promise<string> {
  // Zde by byla integrace s video konference službou (Zoom, Meet, atd.)
  // Pro demo vrátíme placeholder link
  return `https://telemedicine.doktor-na-dohled.cz/room/${appointmentId}`
}

async function sendAppointmentConfirmation(appointment: any, doctor: any, userId: string) {
  // Zde by byla integrace s email službou
  console.log('Odesílám potvrzení termínu:', {
    appointmentId: appointment.id,
    doctorName: `${doctor.first_name} ${doctor.last_name}`,
    date: appointment.appointment_date,
    userId
  })
}

async function sendCancellationNotification(appointment: any, reason: string) {
  // Zde by byla integrace s email službou pro notifikaci o zrušení
  console.log('Odesílám notifikaci o zrušení:', {
    appointmentId: appointment.id,
    reason
  })
}