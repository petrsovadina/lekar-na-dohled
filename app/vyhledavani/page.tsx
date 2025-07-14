"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DoctorList, Doctor } from '@/components/doctor-search/DoctorList'
import { ChatInterface } from '@/components/ChatInterface'
import { 
  Search, 
  MessageCircle, 
  MapPin, 
  Users, 
  Star,
  TrendingUp,
  Clock,
  ArrowLeft,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data pro demo účely - v produkci by se načítalo z API
const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'MUDr. Jana Svobodová',
    specialization: 'praktický lékař',
    description: 'Specializace na preventivní péči, chronické nemoci a geriatrii. Více než 15 let zkušeností.',
    city: 'Praha',
    region: 'Praha',
    address: 'Wenceslas Square 1, 110 00 Praha 1',
    phone: '+420 224 123 456',
    email: 'jana.svobodova@example.com',
    rating: 4.8,
    reviewCount: 127,
    availability: 'available',
    availabilityText: 'Volné termíny tento týden',
    acceptsNewPatients: true,
    insuranceAccepted: ['111', '201', '207'],
    languages: ['čeština', 'angličtina'],
    workingHours: {
      monday: { open: '08:00', close: '16:00' },
      tuesday: { open: '08:00', close: '16:00' },
      wednesday: { open: '08:00', close: '16:00' },
      thursday: { open: '08:00', close: '16:00' },
      friday: { open: '08:00', close: '14:00' },
      saturday: null,
      sunday: null
    },
    verified: true,
    licenseNumber: 'CZ-12345',
    distance: 2.3
  },
  {
    id: '2',
    name: 'MUDr. Petr Novák',
    specialization: 'kardiolog',
    description: 'Specialista na srdeční onemocnění, arytmie a preventivní kardiologii. Atestace z interní medicíny.',
    city: 'Praha',
    region: 'Praha',
    address: 'Národní třída 28, 110 00 Praha 1',
    phone: '+420 224 987 654',
    email: 'petr.novak@example.com',
    rating: 4.9,
    reviewCount: 89,
    availability: 'limited',
    availabilityText: 'Nejbližší termín za 2 týdny',
    acceptsNewPatients: true,
    insuranceAccepted: ['111', '201', '205', '207'],
    languages: ['čeština', 'angličtina', 'němčina'],
    workingHours: {
      monday: { open: '07:00', close: '15:00' },
      tuesday: { open: '07:00', close: '15:00' },
      wednesday: { open: '07:00', close: '15:00' },
      thursday: { open: '07:00', close: '15:00' },
      friday: { open: '07:00', close: '12:00' },
      saturday: null,
      sunday: null
    },
    verified: true,
    licenseNumber: 'CZ-67890',
    distance: 1.8
  },
  {
    id: '3',
    name: 'MUDr. Marie Dvořáková',
    specialization: 'dermatolog',
    description: 'Kožní lékařka se zaměřením na dermatoonkologii, alergologii a estetickou dermatologii.',
    city: 'Brno',
    region: 'Jihomoravský kraj',
    address: 'Koliště 47, 602 00 Brno',
    phone: '+420 541 234 567',
    email: 'marie.dvorakova@example.com',
    rating: 4.7,
    reviewCount: 156,
    availability: 'available',
    availabilityText: 'Volné termíny zítra',
    acceptsNewPatients: true,
    insuranceAccepted: ['111', '201', '207', '209'],
    languages: ['čeština'],
    workingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '15:00' },
      saturday: { open: '08:00', close: '12:00' },
      sunday: null
    },
    verified: true,
    licenseNumber: 'CZ-13579',
    distance: 85.2
  },
  {
    id: '4',
    name: 'MUDr. Tomáš Procházka',
    specialization: 'neurolog',
    description: 'Neurolog specializující se na léčbu migrén, epilepsie a neurodegenerativních onemocnění.',
    city: 'Praha',
    region: 'Praha',
    address: 'Vinohrady 123, 120 00 Praha 2',
    phone: '+420 222 345 678',
    email: 'tomas.prochazka@example.com',
    rating: 4.6,
    reviewCount: 94,
    availability: 'busy',
    availabilityText: 'Nejbližší termín za 4 týdny',
    acceptsNewPatients: false,
    insuranceAccepted: ['111', '201'],
    languages: ['čeština', 'angličtina'],
    workingHours: {
      monday: { open: '09:00', close: '16:00' },
      tuesday: { open: '09:00', close: '16:00' },
      wednesday: { open: '09:00', close: '16:00' },
      thursday: { open: '09:00', close: '16:00' },
      friday: { open: '09:00', close: '14:00' },
      saturday: null,
      sunday: null
    },
    verified: true,
    licenseNumber: 'CZ-24680',
    distance: 3.7
  }
]

export default function VyhledavaniPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors)
  const [loading, setLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  // Získání parametrů z URL (pokud uživatel přišel z AI chatu)
  const initialSearch = searchParams.get('q') || ''
  const initialSpecialization = searchParams.get('specialization') || ''
  const initialRegion = searchParams.get('region') || ''

  useEffect(() => {
    // Simulace načítání dat z API
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    // Zde by se mohla otevřít detailní stránka lékaře
    console.log('Vybraný lékař:', doctor)
  }

  const handleBookAppointment = (doctor: Doctor) => {
    // Přesměrování na stránku rezervace
    router.push(`/rezervace?doctor=${doctor.id}`)
  }

  const handleChatRecommendation = (recommendedDoctors: Doctor[]) => {
    // Aktualizace seznamu lékařů na základě AI doporučení
    setDoctors(recommendedDoctors)
    setShowChat(false)
  }

  // Statistiky pro dashboard
  const stats = [
    {
      title: 'Celkem lékařů',
      value: doctors.length.toString(),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Dostupných nyní',
      value: doctors.filter(d => d.availability === 'available').length.toString(),
      icon: Clock,
      color: 'text-green-600'
    },
    {
      title: 'Průměrné hodnocení',
      value: (doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length).toFixed(1),
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      title: 'Přijímají nové pacienty',
      value: doctors.filter(d => d.acceptsNewPatients).length.toString(),
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět na hlavní stránku
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Search className="w-6 h-6 text-health-primary" />
                Vyhledávání lékařů
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showChat ? "default" : "outline"}
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                {showChat ? 'Skrýt' : 'Zobrazit'} AI asistenta
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Úvodní informace */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-health-primary/5 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-health-primary/10 rounded-full flex items-center justify-center">
                    <Info className="w-6 h-6 text-health-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Najděte si vhodného lékaře
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Vyhledejte lékaře podle specializace, lokality nebo použijte našeho AI asistenta 
                    pro personalizované doporučení na základě vašich příznaků.
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Celá Česká republika
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Ověření lékaři
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Hodnocení od pacientů
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiky */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", stat.color.replace('text-', 'bg-').replace('-600', '-100'))}>
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Hlavní obsah */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vyhledávání lékařů */}
          <div className="lg:col-span-2">
            <DoctorList
              doctors={doctors}
              loading={loading}
              onDoctorSelect={handleDoctorSelect}
              onBookAppointment={handleBookAppointment}
            />
          </div>

          {/* AI Chat asistent */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {showChat ? (
                <div className="space-y-4">
                  <ChatInterface
                    onDoctorRecommendation={handleChatRecommendation as any}
                    className="h-[600px]"
                  />
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">
                            Tip: Použití AI asistenta
                          </h4>
                          <p className="text-sm text-blue-800">
                            Popište své příznaky nebo potřeby a náš AI asistent vám doporučí 
                            vhodné specialisty v okolí.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-health-primary" />
                      AI Asistent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Neznáte kterého specialistu potřebujete? Náš AI asistent vám pomůže 
                      na základě vašich příznaků najít vhodného lékaře.
                    </p>
                    <Button 
                      onClick={() => setShowChat(true)}
                      className="w-full"
                      variant="health"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Spustit AI asistenta
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}