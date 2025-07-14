"use client"

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  MapPin,
  Star,
  Clock,
  User,
  Phone,
  Calendar,
  Filter,
  X,
  Heart,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CZECH_MEDICAL_SPECIALIZATIONS, CZECH_REGIONS } from '@/lib/health/terminology'

// Typy pro lékaře a filtry
export interface Doctor {
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
  workingHours: {
    [key: string]: { open: string; close: string } | null
  }
  profileImage?: string
  verified: boolean
  licenseNumber?: string
  distance?: number
}

interface DoctorFilters {
  searchQuery: string
  specialization: string
  region: string
  city: string
  availability: string
  rating: number
  acceptsNewPatients: boolean
  insurance: string
  sortBy: 'rating' | 'distance' | 'availability' | 'name'
}

interface DoctorListProps {
  doctors: Doctor[]
  loading?: boolean
  onDoctorSelect?: (doctor: Doctor) => void
  onBookAppointment?: (doctor: Doctor) => void
  className?: string
}

// České pojišťovny
const CZECH_INSURANCES = [
  { code: '111', name: 'Všeobecná zdravotní pojišťovna (VZP)' },
  { code: '201', name: 'Vojenská zdravotní pojišťovna (VOZP)' },
  { code: '205', name: 'Česká průmyslová zdravotní pojišťovna (ČPZP)' },
  { code: '207', name: 'Oborová zdravotní pojišťovna (OZP)' },
  { code: '209', name: 'Zaměstnanecká pojišťovna Škoda (ZPŠ)' },
  { code: '211', name: 'Zdravotní pojišťovna ministerstva vnitra (ZPMV)' },
  { code: '213', name: 'Revírní bratrská pokladna (RBP)' }
]

export function DoctorList({ 
  doctors, 
  loading = false, 
  onDoctorSelect, 
  onBookAppointment,
  className 
}: DoctorListProps) {
  const [filters, setFilters] = useState<DoctorFilters>({
    searchQuery: '',
    specialization: '',
    region: '',
    city: '',
    availability: '',
    rating: 0,
    acceptsNewPatients: false,
    insurance: '',
    sortBy: 'rating'
  })

  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Počítání aktivních filtrů
  useEffect(() => {
    const count = Object.entries(filters).filter(([key, value]) => {
      if (key === 'sortBy') return false
      if (typeof value === 'string') return value !== ''
      if (typeof value === 'number') return value > 0
      if (typeof value === 'boolean') return value
      return false
    }).length
    setActiveFiltersCount(count)
  }, [filters])

  // Filtrování a řazení lékařů
  const filteredAndSortedDoctors = useMemo(() => {
    let filtered = doctors.filter(doctor => {
      // Textové vyhledávání
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesName = doctor.name.toLowerCase().includes(query)
        const matchesSpecialization = doctor.specialization.toLowerCase().includes(query)
        const matchesCity = doctor.city.toLowerCase().includes(query)
        const matchesDescription = doctor.description?.toLowerCase().includes(query)
        
        if (!matchesName && !matchesSpecialization && !matchesCity && !matchesDescription) {
          return false
        }
      }

      // Filtr specializace
      if (filters.specialization && doctor.specialization !== filters.specialization) {
        return false
      }

      // Filtr regionu
      if (filters.region && doctor.region !== filters.region) {
        return false
      }

      // Filtr města
      if (filters.city && doctor.city !== filters.city) {
        return false
      }

      // Filtr dostupnosti
      if (filters.availability && doctor.availability !== filters.availability) {
        return false
      }

      // Filtr hodnocení
      if (filters.rating > 0 && doctor.rating < filters.rating) {
        return false
      }

      // Filtr nových pacientů
      if (filters.acceptsNewPatients && !doctor.acceptsNewPatients) {
        return false
      }

      // Filtr pojišťovny
      if (filters.insurance && !doctor.insuranceAccepted.includes(filters.insurance)) {
        return false
      }

      return true
    })

    // Řazení
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'distance':
          return (a.distance || 0) - (b.distance || 0)
        case 'availability':
          const availabilityOrder = { 'available': 0, 'limited': 1, 'busy': 2 }
          return availabilityOrder[a.availability] - availabilityOrder[b.availability]
        case 'name':
          return a.name.localeCompare(b.name, 'cs')
        default:
          return 0
      }
    })

    return filtered
  }, [doctors, filters])

  // Resetování filtrů
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      specialization: '',
      region: '',
      city: '',
      availability: '',
      rating: 0,
      acceptsNewPatients: false,
      insurance: '',
      sortBy: 'rating'
    })
  }

  // Komponenta pro jednotlivé karty lékařů
  const DoctorCard = ({ doctor }: { doctor: Doctor }) => {
    const availabilityColor = {
      available: 'text-green-600',
      limited: 'text-yellow-600',
      busy: 'text-red-600'
    }

    const availabilityText = {
      available: 'Dostupný',
      limited: 'Omezená dostupnost',
      busy: 'Obsazený'
    }

    return (
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => onDoctorSelect?.(doctor)}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-health-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-health-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {doctor.name}
                  {doctor.verified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600 mb-1">
                  {doctor.specialization}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {doctor.city}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {doctor.rating} ({doctor.reviewCount} hodnocení)
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className={cn("flex items-center gap-1 text-sm", availabilityColor[doctor.availability])}>
                <Clock className="w-4 h-4" />
                {availabilityText[doctor.availability]}
              </div>
              {doctor.distance && (
                <span className="text-xs text-gray-500">{doctor.distance} km</span>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {doctor.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {doctor.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-gray-400" />
                {doctor.phone}
              </div>
              {doctor.acceptsNewPatients && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Přijímá nové pacienty
                </div>
              )}
            </div>
            
            <Button 
              onClick={(e) => {
                e.stopPropagation()
                onBookAppointment?.(doctor)
              }}
              variant="health"
              size="sm"
              className="ml-auto"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Rezervovat
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-primary"></div>
          <span className="ml-2 text-gray-600">Načítám lékaře...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hlavní vyhledávací panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-health-primary" />
              Vyhledávání lékařů
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              Filtry
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-health-primary text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Základní vyhledávání */}
          <div className="flex gap-2">
            <Input
              placeholder="Hledat podle jména, specializace nebo města..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="flex-1"
            />
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as DoctorFilters['sortBy'] }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Řadit podle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Hodnocení</SelectItem>
                <SelectItem value="distance">Vzdálenost</SelectItem>
                <SelectItem value="availability">Dostupnost</SelectItem>
                <SelectItem value="name">Jméno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rozšířené filtry */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
              {/* Specializace */}
              <div>
                <label className="block text-sm font-medium mb-1">Specializace</label>
                <Select
                  value={filters.specialization}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, specialization: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte specializaci" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Všechny specializace</SelectItem>
                    {Object.entries(CZECH_MEDICAL_SPECIALIZATIONS).map(([key, data]) => (
                      <SelectItem key={key} value={key}>
                        {key} - {data.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium mb-1">Kraj</label>
                <Select
                  value={filters.region}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte kraj" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Všechny kraje</SelectItem>
                    {Object.keys(CZECH_REGIONS).map(region => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pojišťovna */}
              <div>
                <label className="block text-sm font-medium mb-1">Pojišťovna</label>
                <Select
                  value={filters.insurance}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, insurance: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte pojišťovnu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Všechny pojišťovny</SelectItem>
                    {CZECH_INSURANCES.map(insurance => (
                      <SelectItem key={insurance.code} value={insurance.code}>
                        {insurance.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dostupnost */}
              <div>
                <label className="block text-sm font-medium mb-1">Dostupnost</label>
                <Select
                  value={filters.availability}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte dostupnost" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Všechna dostupnost</SelectItem>
                    <SelectItem value="available">Dostupný</SelectItem>
                    <SelectItem value="limited">Omezená dostupnost</SelectItem>
                    <SelectItem value="busy">Obsazený</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hodnocení */}
              <div>
                <label className="block text-sm font-medium mb-1">Minimální hodnocení</label>
                <Select
                  value={filters.rating.toString()}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, rating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte hodnocení" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Všechna hodnocení</SelectItem>
                    <SelectItem value="3">3+ hvězdiček</SelectItem>
                    <SelectItem value="4">4+ hvězdiček</SelectItem>
                    <SelectItem value="5">5 hvězdiček</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nové pacienty */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="newPatients"
                  checked={filters.acceptsNewPatients}
                  onChange={(e) => setFilters(prev => ({ ...prev, acceptsNewPatients: e.target.checked }))}
                  className="w-4 h-4 text-health-primary border-gray-300 rounded focus:ring-health-primary"
                />
                <label htmlFor="newPatients" className="text-sm font-medium">
                  Pouze lékaři přijímající nové pacienty
                </label>
              </div>

              {/* Resetování filtrů */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Zrušit filtry
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Výsledky vyhledávání */}
      <div className="space-y-4">
        {/* Statistiky */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            Nalezeno {filteredAndSortedDoctors.length} lékařů
            {filters.searchQuery && (
              <span>pro "{filters.searchQuery}"</span>
            )}
          </div>
          {filteredAndSortedDoctors.length > 0 && (
            <div className="text-sm text-gray-500">
              Řazeno podle: {
                filters.sortBy === 'rating' ? 'hodnocení' :
                filters.sortBy === 'distance' ? 'vzdálenosti' :
                filters.sortBy === 'availability' ? 'dostupnosti' : 'jména'
              }
            </div>
          )}
        </div>

        {/* Seznam lékařů */}
        {filteredAndSortedDoctors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-600 mb-1">
                Žádní lékaři nenalezeni
              </h3>
              <p className="text-gray-500 text-center">
                Zkuste změnit vyhledávací kritéria nebo upravit filtry.
              </p>
              {activeFiltersCount > 0 && (
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="mt-4"
                >
                  Zrušit všechny filtry
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedDoctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}