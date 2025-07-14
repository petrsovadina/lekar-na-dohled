"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Clock, User, MapPin, Phone, Mail, CreditCard, Shield, CheckCircle, AlertCircle, ArrowLeft, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BookingCalendar } from '@/components/booking/BookingCalendar'
import { useAuth } from '@/components/auth/AuthProvider'
import { GDPRConsent } from '@/components/gdpr/GDPRConsent'
import { cn } from '@/lib/utils'
import type { Doctor, AppointmentBookingData, Appointment, ConsentType } from '@/types'

const CZECH_INSURANCE_PROVIDERS = {
  '111': 'Všeobecná zdravotní pojišťovna České republiky',
  '201': 'Vojenská zdravotní pojišťovna České republiky',
  '205': 'Česká průmyslová zdravotní pojišťovna',
  '207': 'Oborová zdravotní pojišťovna zaměstnanců bank, pojišťoven a stavebnictví',
  '209': 'Zaměstnanecká pojišťovna Škoda',
  '211': 'Zdravotní pojišťovna ministerstva vnitra České republiky',
  '213': 'Revírní bratrská pokladna, zdravotní pojišťovna'
}

type BookingStep = 'doctor-selection' | 'calendar' | 'confirmation' | 'consent' | 'success'

export default function ReservationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isPatient, loading: authLoading } = useAuth()
  
  const [step, setStep] = useState<BookingStep>('doctor-selection')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [bookingData, setBookingData] = useState<AppointmentBookingData | null>(null)
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [insuranceVerified, setInsuranceVerified] = useState<boolean | null>(null)
  const [requiredConsents, setRequiredConsents] = useState<ConsentType[]>([])

  // Načtení lékaře z URL parametrů
  useEffect(() => {
    const doctorId = searchParams.get('doctor')
    if (doctorId) {
      fetchDoctor(doctorId)
    }
  }, [searchParams])

  // Kontrola autentizace
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/rezervace')
    }
    if (!authLoading && user && !isPatient) {
      router.push('/dashboard')
    }
  }, [user, isPatient, authLoading, router])

  const fetchDoctor = async (doctorId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/doctors/${doctorId}`)
      if (response.ok) {
        const doctor = await response.json()
        setSelectedDoctor(doctor)
        setStep('calendar')
        
        // Kontrola pojištění
        await verifyInsurance(doctor)
      } else {
        setError('Lékař nebyl nalezen')
        router.push('/vyhledavani')
      }
    } catch (error) {
      setError('Chyba při načítání údajů lékaře')
    } finally {
      setLoading(false)
    }
  }

  const verifyInsurance = async (doctor: Doctor) => {
    if (!user?.user_metadata?.insuranceProvider) {
      setInsuranceVerified(false)
      return
    }

    const userInsurance = user.user_metadata.insuranceProvider
    const isAccepted = doctor.accepted_insurances.includes(userInsurance)
    setInsuranceVerified(isAccepted)
  }

  const handleDoctorSelection = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setStep('calendar')
    verifyInsurance(doctor)
  }

  const handleBookingSubmit = async (data: AppointmentBookingData) => {
    setBookingData(data)
    setStep('confirmation')
    return { success: true }
  }

  const handleConfirmBooking = async () => {
    if (!bookingData || !selectedDoctor) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          insurance_verified: insuranceVerified
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCreatedAppointment(result.data)
        
        // Kontrola potřebných GDPR souhlasů
        const consents: ConsentType[] = ['medical_records', 'appointment_history']
        if (bookingData.consultationType === 'telemedicine') {
          consents.push('telemedicine')
        }
        
        setRequiredConsents(consents)
        setStep('consent')
      } else {
        setError(result.error || 'Chyba při vytváření rezervace')
      }
    } catch (error) {
      setError('Neočekávaná chyba při rezervaci')
    } finally {
      setLoading(false)
    }
  }

  const handleConsentComplete = async (consents: Record<ConsentType, boolean>) => {
    // Zaznamenání GDPR souhlasů
    try {
      for (const [consentType, granted] of Object.entries(consents)) {
        await fetch('/api/gdpr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'record-consent',
            userId: user?.id,
            consentType,
            consentGiven: granted
          }),
        })
      }
      
      setStep('success')
    } catch (error) {
      console.error('Chyba při ukládání souhlasů:', error)
      setStep('success') // Pokračuj i při chybě souhlasů
    }
  }

  const handleBackToSearch = () => {
    router.push('/vyhledavani')
  }

  const handleNewBooking = () => {
    setStep('doctor-selection')
    setSelectedDoctor(null)
    setBookingData(null)
    setCreatedAppointment(null)
    setError('')
    router.push('/vyhledavani')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám...</p>
        </div>
      </div>
    )
  }

  if (!user || !isPatient) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToSearch}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Zpět na vyhledávání
          </Button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Rezervace termínu</span>
        </div>

        {/* Progress indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            {[
              { key: 'calendar', label: 'Výběr termínu', icon: Calendar },
              { key: 'confirmation', label: 'Potvrzení', icon: CheckCircle },
              { key: 'consent', label: 'GDPR souhlas', icon: Shield },
              { key: 'success', label: 'Dokončeno', icon: Heart }
            ].map((stepInfo, index) => {
              const isActive = 
                (step === 'calendar' && stepInfo.key === 'calendar') ||
                (step === 'confirmation' && index <= 1) ||
                (step === 'consent' && index <= 2) ||
                (step === 'success' && index <= 3)
              
              return (
                <div key={stepInfo.key} className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full",
                    isActive ? "bg-health-primary text-white" : "bg-gray-200 text-gray-500"
                  )}>
                    <stepInfo.icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "ml-2 text-sm font-medium",
                    isActive ? "text-health-primary" : "text-gray-500"
                  )}>
                    {stepInfo.label}
                  </span>
                  {index < 3 && (
                    <div className={cn(
                      "w-16 h-0.5 mx-4",
                      index < 2 || step === 'success' ? "bg-health-primary" : "bg-gray-200"
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Step */}
        {step === 'calendar' && selectedDoctor && (
          <div className="space-y-6">
            {/* Doctor info card */}
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-health-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-health-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedDoctor.first_name} {selectedDoctor.last_name}
                    </h2>
                    <p className="text-gray-600">{selectedDoctor.specialization}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedDoctor.city}, {selectedDoctor.region}
                      </div>
                      {selectedDoctor.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {selectedDoctor.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {selectedDoctor.average_rating && (
                      <div className="text-lg font-bold text-health-primary">
                        ⭐ {selectedDoctor.average_rating.toFixed(1)}
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      {selectedDoctor.total_reviews} hodnocení
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insurance verification */}
            {insuranceVerified !== null && (
              <Card className="max-w-4xl mx-auto">
                <CardContent className="p-4">
                  <div className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    insuranceVerified 
                      ? "bg-green-50 border border-green-200" 
                      : "bg-orange-50 border border-orange-200"
                  )}>
                    {insuranceVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                    <div className="flex-1">
                      <p className={cn(
                        "font-medium",
                        insuranceVerified ? "text-green-800" : "text-orange-800"
                      )}>
                        {insuranceVerified 
                          ? "Vaše pojišťovna je akceptována" 
                          : "Pozor: Vaše pojišťovna není v seznamu akceptovaných pojišťoven"
                        }
                      </p>
                      <p className={cn(
                        "text-sm",
                        insuranceVerified ? "text-green-600" : "text-orange-600"
                      )}>
                        {user.user_metadata?.insuranceProvider && 
                          CZECH_INSURANCE_PROVIDERS[user.user_metadata.insuranceProvider as keyof typeof CZECH_INSURANCE_PROVIDERS]
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking calendar */}
            <BookingCalendar
              doctor={selectedDoctor}
              onBookingSubmit={handleBookingSubmit}
            />
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' && selectedDoctor && bookingData && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-health-primary" />
                Potvrzení rezervace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Appointment details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Detaily termínu:</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Lékař:</span>
                    <div className="font-medium">
                      {selectedDoctor.first_name} {selectedDoctor.last_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Specializace:</span>
                    <div className="font-medium">{selectedDoctor.specialization}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Datum:</span>
                    <div className="font-medium">
                      {new Date(bookingData.appointmentDate).toLocaleDateString('cs-CZ', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Čas:</span>
                    <div className="font-medium">
                      {new Date(bookingData.appointmentDate).toLocaleTimeString('cs-CZ', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Typ konzultace:</span>
                    <div className="font-medium">
                      {bookingData.consultationType === 'in-person' && 'Osobní návštěva'}
                      {bookingData.consultationType === 'telemedicine' && 'Telemedicína'}
                      {bookingData.consultationType === 'phone' && 'Telefonická konzultace'}
                      {bookingData.consultationType === 'chat' && 'Chat konzultace'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Priorita:</span>
                    <Badge variant="secondary" className={
                      bookingData.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                      bookingData.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {bookingData.priority === 'emergency' && 'Akutní'}
                      {bookingData.priority === 'urgent' && 'Urgentní'}
                      {bookingData.priority === 'normal' && 'Běžné'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="text-gray-500">Důvod návštěvy:</span>
                  <div className="font-medium mt-1">{bookingData.reason}</div>
                </div>

                {bookingData.symptoms && bookingData.symptoms.length > 0 && (
                  <div>
                    <span className="text-gray-500">Příznaky:</span>
                    <div className="font-medium mt-1">
                      {bookingData.symptoms.join(', ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Patient info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Údaje pacienta:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Jméno:</span>
                    <div className="font-medium">
                      {user.user_metadata?.firstName} {user.user_metadata?.lastName}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <div className="font-medium">{user.email}</div>
                  </div>
                  {user.user_metadata?.phone && (
                    <div>
                      <span className="text-gray-500">Telefon:</span>
                      <div className="font-medium">{user.user_metadata.phone}</div>
                    </div>
                  )}
                  {user.user_metadata?.insuranceProvider && (
                    <div>
                      <span className="text-gray-500">Pojišťovna:</span>
                      <div className="font-medium">
                        {CZECH_INSURANCE_PROVIDERS[user.user_metadata.insuranceProvider as keyof typeof CZECH_INSURANCE_PROVIDERS]}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Important notes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Důležité informace:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Přijďte prosím 10 minut před termínem</li>
                  <li>• Vezměte si s sebou občanský průkaz a kartu pojišťovny</li>
                  {bookingData.consultationType === 'telemedicine' && (
                    <li>• Odkaz na videohovor vám bude zaslán emailem</li>
                  )}
                  <li>• V případě potřeby zrušení kontaktujte ordinaci alespoň 24 hodin předem</li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('calendar')}
                  className="flex-1"
                >
                  Upravit rezervaci
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="flex-1"
                  variant="health"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Potvrzuji...
                    </>
                  ) : (
                    'Potvrdit rezervaci'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GDPR Consent Step */}
        {step === 'consent' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-health-primary" />
                  GDPR souhlas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Pro dokončení rezervace prosím udělte souhlas se zpracováním vašich osobních údajů podle GDPR.
                </p>
                <GDPRConsent
                  requiredConsents={requiredConsents as any}
                  onConsentChange={handleConsentComplete as any}
                  showDetails={true}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && createdAppointment && selectedDoctor && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Rezervace potvrzena!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Váš termín byl úspěšně zarezervován. Potvrzení bylo odesláno na váš email.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold mb-4">Shrnutí termínu:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Číslo rezervace:</span>
                    <span className="font-mono">{createdAppointment.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lékař:</span>
                    <span>{selectedDoctor.first_name} {selectedDoctor.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Datum a čas:</span>
                    <span>
                      {new Date(createdAppointment.appointment_date).toLocaleString('cs-CZ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Typ:</span>
                    <span>
                      {createdAppointment.consultation_type === 'in-person' && 'Osobní návštěva'}
                      {createdAppointment.consultation_type === 'telemedicine' && 'Telemedicína'}
                      {createdAppointment.consultation_type === 'phone' && 'Telefonická konzultace'}
                      {createdAppointment.consultation_type === 'chat' && 'Chat konzultace'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1"
                >
                  Přejít na dashboard
                </Button>
                <Button
                  onClick={handleNewBooking}
                  className="flex-1"
                  variant="health"
                >
                  Nová rezervace
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Doctor selection - fallback */}
        {step === 'doctor-selection' && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Vyberte lékaře
              </h2>
              <p className="text-gray-600 mb-6">
                Pro rezervaci termínu nejprve vyhledejte a vyberte lékaře.
              </p>
              <Button onClick={handleBackToSearch} variant="health">
                Vyhledat lékaře
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}