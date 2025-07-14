import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CZECH_MEDICAL_SPECIALIZATIONS, CZECH_REGIONS } from '@/lib/health/terminology'

// Supabase client pro server-side operace
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Typy pro API requests a responses
interface DoctorSearchParams {
  query?: string
  specialization?: string
  region?: string
  city?: string
  availability?: 'available' | 'limited' | 'busy'
  rating?: number
  acceptsNewPatients?: boolean
  insurance?: string
  latitude?: number
  longitude?: number
  radius?: number
  sortBy?: 'rating' | 'distance' | 'availability' | 'name'
  page?: number
  limit?: number
}

interface DoctorResponse {
  id: string
  name: string
  specialization: string
  description?: string
  city: string
  region: string
  address: string
  phone: string
  email?: string
  rating: number
  reviewCount: number
  availability: 'available' | 'limited' | 'busy'
  availabilityText: string
  acceptsNewPatients: boolean
  insuranceAccepted: string[]
  languages: string[]
  workingHours: Record<string, { open: string; close: string } | null>
  profileImage?: string
  verified: boolean
  licenseNumber?: string
  distance?: number
  nextAvailableDate?: string
}

// Funkce pro parsování search parametrů
function parseSearchParams(request: NextRequest): DoctorSearchParams {
  const { searchParams } = new URL(request.url)
  
  return {
    query: searchParams.get('q') || undefined,
    specialization: searchParams.get('specialization') || undefined,
    region: searchParams.get('region') || undefined,
    city: searchParams.get('city') || undefined,
    availability: searchParams.get('availability') as DoctorSearchParams['availability'] || undefined,
    rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
    acceptsNewPatients: searchParams.get('acceptsNewPatients') === 'true',
    insurance: searchParams.get('insurance') || undefined,
    latitude: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
    longitude: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
    radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : 50, // default 50km
    sortBy: searchParams.get('sortBy') as DoctorSearchParams['sortBy'] || 'rating',
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
  }
}

// Funkce pro validaci specializace
function validateSpecialization(specialization: string): boolean {
  return Object.keys(CZECH_MEDICAL_SPECIALIZATIONS).includes(specialization)
}

// Funkce pro validaci regionu
function validateRegion(region: string): boolean {
  return Object.keys(CZECH_REGIONS).includes(region)
}

// Funkce pro výpočet vzdálenosti (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Poloměr Země v km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Funkce pro detekci dostupnosti na základě ordinačních hodin
function getDoctorAvailability(workingHours: any, nextAvailableSlot?: string): {
  availability: 'available' | 'limited' | 'busy',
  availabilityText: string,
  nextAvailableDate?: string
} {
  const now = new Date()
  const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  
  if (nextAvailableSlot) {
    const nextDate = new Date(nextAvailableSlot)
    const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil <= 3) {
      return {
        availability: 'available',
        availabilityText: `Volný termín ${daysUntil === 0 ? 'dnes' : daysUntil === 1 ? 'zítra' : `za ${daysUntil} dny`}`,
        nextAvailableDate: nextAvailableSlot
      }
    } else if (daysUntil <= 14) {
      return {
        availability: 'limited',
        availabilityText: `Nejbližší termín za ${daysUntil} dní`,
        nextAvailableDate: nextAvailableSlot
      }
    } else {
      return {
        availability: 'busy',
        availabilityText: `Nejbližší termín za ${daysUntil} dní`,
        nextAvailableDate: nextAvailableSlot
      }
    }
  }
  
  // Fallback na základě pracovních hodin
  const todayHours = workingHours[today]
  if (todayHours) {
    return {
      availability: 'available',
      availabilityText: 'Volné termíny tento týden'
    }
  }
  
  return {
    availability: 'limited',
    availabilityText: 'Omezeně dostupný'
  }
}

// GET endpoint pro vyhledávání lékařů
export async function GET(request: NextRequest) {
  try {
    const params = parseSearchParams(request)
    
    // Validace parametrů
    if (params.specialization && !validateSpecialization(params.specialization)) {
      return NextResponse.json(
        { error: 'Neplatná specializace', availableSpecializations: Object.keys(CZECH_MEDICAL_SPECIALIZATIONS) },
        { status: 400 }
      )
    }
    
    if (params.region && !validateRegion(params.region)) {
      return NextResponse.json(
        { error: 'Neplatný region', availableRegions: Object.keys(CZECH_REGIONS) },
        { status: 400 }
      )
    }
    
    // Sestavení dotazu do databáze
    let query = supabase
      .from('doctors')
      .select(`
        *,
        doctor_specializations!inner(
          specialization_name
        ),
        doctor_locations!inner(
          city,
          region,
          address,
          latitude,
          longitude
        ),
        doctor_working_hours(
          day_of_week,
          opening_time,
          closing_time
        ),
        doctor_reviews(
          rating,
          created_at
        ),
        appointment_slots(
          start_time,
          is_available
        )
      `)
      .eq('verified', true)
      .eq('active', true)
    
    // Filtrování podle specializace
    if (params.specialization) {
      query = query.eq('doctor_specializations.specialization_name', params.specialization)
    }
    
    // Filtrování podle regionu
    if (params.region) {
      query = query.eq('doctor_locations.region', params.region)
    }
    
    // Filtrování podle města
    if (params.city) {
      query = query.ilike('doctor_locations.city', `%${params.city}%`)
    }
    
    // Filtrování podle přijímání nových pacientů
    if (params.acceptsNewPatients) {
      query = query.eq('accepts_new_patients', true)
    }
    
    // Filtrování podle pojišťovny
    if (params.insurance) {
      query = query.contains('insurance_accepted', [params.insurance])
    }
    
    // Filtrování podle hodnocení
    if (params.rating) {
      query = query.gte('rating', params.rating)
    }
    
    // Textové vyhledávání
    if (params.query) {
      const searchQuery = params.query.toLowerCase()
      query = query.or(`
        name.ilike.%${searchQuery}%,
        description.ilike.%${searchQuery}%,
        doctor_specializations.specialization_name.ilike.%${searchQuery}%,
        doctor_locations.city.ilike.%${searchQuery}%
      `)
    }
    
    // Stránkování
    const offset = (params.page! - 1) * params.limit!
    query = query.range(offset, offset + params.limit! - 1)
    
    // Spuštění dotazu
    const { data: doctors, error, count } = await query
    
    if (error) {
      console.error('Chyba při vyhledávání lékařů:', error)
      return NextResponse.json(
        { error: 'Chyba při vyhledávání lékařů' },
        { status: 500 }
      )
    }
    
    // Zpracování výsledků
    const processedDoctors: DoctorResponse[] = doctors?.map(doctor => {
      // Zpracování pracovních hodin
      const workingHours: Record<string, { open: string; close: string } | null> = {
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null
      }
      
      doctor.doctor_working_hours?.forEach((hour: any) => {
        const dayMap: Record<number, string> = {
          1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday',
          5: 'friday', 6: 'saturday', 0: 'sunday'
        }
        const dayName = dayMap[hour.day_of_week]
        if (dayName) {
          workingHours[dayName] = {
            open: hour.opening_time,
            close: hour.closing_time
          }
        }
      })
      
      // Výpočet průměrného hodnocení
      const reviews = doctor.doctor_reviews || []
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
        : 0
      
      // Nalezení nejbližšího dostupného termínu
      const availableSlots = doctor.appointment_slots?.filter((slot: any) => slot.is_available) || []
      const nextAvailableSlot = availableSlots.length > 0 
        ? availableSlots.sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0]
        : null
      
      // Určení dostupnosti
      const availabilityInfo = getDoctorAvailability(workingHours, nextAvailableSlot?.start_time)
      
      // Výpočet vzdálenosti (pokud jsou poskytnuty souřadnice)
      let distance: number | undefined
      if (params.latitude && params.longitude && doctor.doctor_locations[0]?.latitude && doctor.doctor_locations[0]?.longitude) {
        distance = calculateDistance(
          params.latitude,
          params.longitude,
          doctor.doctor_locations[0].latitude,
          doctor.doctor_locations[0].longitude
        )
      }
      
      return {
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.doctor_specializations[0]?.specialization_name || '',
        description: doctor.description,
        city: doctor.doctor_locations[0]?.city || '',
        region: doctor.doctor_locations[0]?.region || '',
        address: doctor.doctor_locations[0]?.address || '',
        phone: doctor.phone,
        email: doctor.email,
        rating: avgRating,
        reviewCount: reviews.length,
        availability: availabilityInfo.availability,
        availabilityText: availabilityInfo.availabilityText,
        acceptsNewPatients: doctor.accepts_new_patients,
        insuranceAccepted: doctor.insurance_accepted || [],
        languages: doctor.languages || ['čeština'],
        workingHours,
        profileImage: doctor.profile_image,
        verified: doctor.verified,
        licenseNumber: doctor.license_number,
        distance,
        nextAvailableDate: availabilityInfo.nextAvailableDate
      }
    }) || []
    
    // Filtrování podle dostupnosti (pokud je zadáno)
    let filteredDoctors = processedDoctors
    if (params.availability) {
      filteredDoctors = processedDoctors.filter(doctor => doctor.availability === params.availability)
    }
    
    // Filtrování podle vzdálenosti (pokud jsou zadány souřadnice)
    if (params.latitude && params.longitude && params.radius) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        !doctor.distance || doctor.distance <= params.radius!
      )
    }
    
    // Řazení výsledků
    filteredDoctors.sort((a, b) => {
      switch (params.sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'distance':
          if (!a.distance && !b.distance) return 0
          if (!a.distance) return 1
          if (!b.distance) return -1
          return a.distance - b.distance
        case 'availability':
          const availabilityOrder = { 'available': 0, 'limited': 1, 'busy': 2 }
          return availabilityOrder[a.availability] - availabilityOrder[b.availability]
        case 'name':
          return a.name.localeCompare(b.name, 'cs')
        default:
          return 0
      }
    })
    
    // Příprava metadata pro odpověď
    const metadata = {
      total: count || 0,
      page: params.page!,
      limit: params.limit!,
      totalPages: Math.ceil((count || 0) / params.limit!),
      hasNextPage: params.page! < Math.ceil((count || 0) / params.limit!),
      hasPreviousPage: params.page! > 1,
      filters: {
        specialization: params.specialization,
        region: params.region,
        city: params.city,
        availability: params.availability,
        rating: params.rating,
        acceptsNewPatients: params.acceptsNewPatients,
        insurance: params.insurance
      },
      sort: params.sortBy,
      searchQuery: params.query
    }
    
    return NextResponse.json({
      success: true,
      data: filteredDoctors,
      metadata
    })
    
  } catch (error) {
    console.error('Neočekávaná chyba při vyhledávání lékařů:', error)
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    )
  }
}

// POST endpoint pro pokročilé vyhledávání s complex filters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validace request body
    const {
      filters,
      location,
      sort,
      pagination
    } = body
    
    // Implementace pokročilého vyhledávání
    // Tato funkcionalita by mohla zahrnovat:
    // - Komplexní kombinace filtrů
    // - Fulltextové vyhledávání
    // - Fuzzy search
    // - Vyhledávání podle symptomů
    // - AI-powered doporučení
    
    return NextResponse.json({
      message: 'Pokročilé vyhledávání bude implementováno v další verzi'
    })
    
  } catch (error) {
    console.error('Chyba při pokročilém vyhledávání:', error)
    return NextResponse.json(
      { error: 'Chyba při zpracování požadavku' },
      { status: 500 }
    )
  }
}

// GET endpoint pro získání dostupných filtrů
export async function OPTIONS() {
  const availableFilters = {
    specializations: Object.keys(CZECH_MEDICAL_SPECIALIZATIONS),
    regions: Object.keys(CZECH_REGIONS),
    insurances: [
      { code: '111', name: 'Všeobecná zdravotní pojišťovna (VZP)' },
      { code: '201', name: 'Vojenská zdravotní pojišťovna (VOZP)' },
      { code: '205', name: 'Česká průmyslová zdravotní pojišťovna (ČPZP)' },
      { code: '207', name: 'Oborová zdravotní pojišťovna (OZP)' },
      { code: '209', name: 'Zaměstnanecká pojišťovna Škoda (ZPŠ)' },
      { code: '211', name: 'Zdravotní pojišťovna ministerstva vnitra (ZPMV)' },
      { code: '213', name: 'Revírní bratrská pokladna (RBP)' }
    ],
    availability: ['available', 'limited', 'busy'],
    sortOptions: ['rating', 'distance', 'availability', 'name'],
    languages: ['čeština', 'angličtina', 'němčina', 'francouzština', 'španělština']
  }
  
  return NextResponse.json(availableFilters)
}