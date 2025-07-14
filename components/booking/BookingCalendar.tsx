"use client"

import { useState, useEffect, useMemo } from 'react'
import { Calendar, Clock, User, AlertCircle, CheckCircle, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { 
  Doctor, 
  AppointmentBookingData, 
  ConsultationType, 
  AppointmentPriority,
  DoctorAvailability,
  AvailabilitySlot 
} from '@/types'

// České svátky 2024-2025
const CZECH_HOLIDAYS = {
  '2024-01-01': 'Nový rok',
  '2024-04-01': 'Velikonoční pondělí',
  '2024-05-01': 'Svátek práce',
  '2024-05-08': 'Den vítězství',
  '2024-07-05': 'Den slovanských věrozvěstů',
  '2024-07-06': 'Den upálení Mistra Jana Husa',
  '2024-09-28': 'Den české státnosti',
  '2024-10-28': 'Den vzniku samostatného československého státu',
  '2024-11-17': 'Den boje za svobodu a demokracii',
  '2024-12-24': 'Štědrý den',
  '2024-12-25': 'Vánoce',
  '2024-12-26': 'Svatý Štěpán',
  '2025-01-01': 'Nový rok',
  '2025-04-21': 'Velikonoční pondělí',
  '2025-05-01': 'Svátek práce',
  '2025-05-08': 'Den vítězství',
  '2025-07-05': 'Den slovanských věrozvěstů',
  '2025-07-06': 'Den upálení Mistra Jana Husa',
  '2025-09-28': 'Den české státnosti',
  '2025-10-28': 'Den vzniku samostatného československého státu',
  '2025-11-17': 'Den boje za svobodu a demokracii',
  '2025-12-24': 'Štědrý den',
  '2025-12-25': 'Vánoce',
  '2025-12-26': 'Svatý Štěpán'
}

const CZECH_MONTHS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
]

const CZECH_DAYS_SHORT = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']

const CONSULTATION_TYPES: { value: ConsultationType; label: string; duration: number }[] = [
  { value: 'in-person', label: 'Osobní návštěva', duration: 30 },
  { value: 'telemedicine', label: 'Telemedicína', duration: 20 },
  { value: 'phone', label: 'Telefonická konzultace', duration: 15 },
  { value: 'chat', label: 'Chat konzultace', duration: 10 }
]

const PRIORITY_OPTIONS: { value: AppointmentPriority; label: string; color: string }[] = [
  { value: 'normal', label: 'Běžné', color: 'bg-blue-100 text-blue-800' },
  { value: 'urgent', label: 'Urgentní', color: 'bg-orange-100 text-orange-800' },
  { value: 'emergency', label: 'Akutní', color: 'bg-red-100 text-red-800' }
]

interface BookingCalendarProps {
  doctor: Doctor
  onBookingSubmit: (bookingData: AppointmentBookingData) => Promise<{ success: boolean; error?: string }>
  onClose?: () => void
  initialDate?: Date
  className?: string
}

interface TimeSlotInfo extends AvailabilitySlot {
  available: boolean
  holiday?: string
  doctorNote?: string
}

export function BookingCalendar({
  doctor,
  onBookingSubmit,
  onClose,
  initialDate = new Date(),
  className
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [consultationType, setConsultationType] = useState<ConsultationType>('in-person')
  const [priority, setPriority] = useState<AppointmentPriority>('normal')
  const [reason, setReason] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availability, setAvailability] = useState<DoctorAvailability[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  // Načtení dostupnosti lékaře pro aktuální měsíc
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoadingAvailability(true)
      try {
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        
        const response = await fetch(`/api/doctors/${doctor.id}/availability?` + new URLSearchParams({
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }))
        
        if (response.ok) {
          const data = await response.json()
          setAvailability(data.availability || [])
        }
      } catch (error) {
        console.error('Chyba při načítání dostupnosti:', error)
      } finally {
        setLoadingAvailability(false)
      }
    }

    fetchAvailability()
  }, [currentDate, doctor.id])

  // Generování kalendářních dnů
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dateStr = date.toISOString().split('T')[0]
      const isCurrentMonth = date.getMonth() === month
      const isToday = date.getTime() === today.getTime()
      const isPast = date < today
      const isHoliday = CZECH_HOLIDAYS[dateStr]
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      
      // Najít dostupnost pro tento den
      const dayAvailability = availability.find(a => a.date === dateStr)
      const hasAvailableSlots = dayAvailability?.time_slots.some(slot => !slot.is_booked) || false
      
      days.push({
        date,
        dateStr,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isHoliday,
        isWeekend,
        hasAvailableSlots,
        holiday: isHoliday,
        availability: dayAvailability
      })
    }

    return days
  }, [currentDate, availability])

  // Časové sloty pro vybraný den
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return []
    
    const dateStr = selectedDate.toISOString().split('T')[0]
    const dayAvailability = availability.find(a => a.date === dateStr)
    
    if (!dayAvailability) return []
    
    return dayAvailability.time_slots.map(slot => ({
      ...slot,
      available: !slot.is_booked,
      holiday: CZECH_HOLIDAYS[dateStr],
      doctorNote: dayAvailability.notes
    }))
  }, [selectedDate, availability])

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDate(null)
    setSelectedTimeSlot(null)
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDate(null)
    setSelectedTimeSlot(null)
  }

  const handleDateSelect = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) return
    
    setSelectedDate(date)
    setSelectedTimeSlot(null)
    setError('')
  }

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
    setError('')
  }

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot || !reason.trim()) {
      setError('Vyberte prosím datum, čas a důvod návštěvy')
      return
    }

    const [startTime] = selectedTimeSlot.split(' - ')
    const appointmentDateTime = new Date(selectedDate)
    const [hours, minutes] = startTime.split(':').map(Number)
    appointmentDateTime.setHours(hours, minutes, 0, 0)

    const bookingData: AppointmentBookingData = {
      doctorId: doctor.id,
      appointmentDate: appointmentDateTime.toISOString(),
      consultationType,
      reason: reason.trim(),
      priority,
      symptoms: symptoms.trim() ? symptoms.split(',').map(s => s.trim()) : undefined,
      notes: symptoms.trim() || undefined
    }

    setLoading(true)
    setError('')

    try {
      const result = await onBookingSubmit(bookingData)
      if (result.success) {
        onClose?.()
      } else {
        setError(result.error || 'Chyba při rezervaci termínu')
      }
    } catch (error) {
      setError('Neočekávaná chyba při rezervaci')
    } finally {
      setLoading(false)
    }
  }

  const selectedConsultationType = CONSULTATION_TYPES.find(t => t.value === consultationType)
  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === priority)

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-health-primary" />
          <div>
            <CardTitle className="text-xl">Rezervace termínu</CardTitle>
            <p className="text-sm text-gray-600">
              {doctor.first_name} {doctor.last_name} - {doctor.specialization}
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kalendář */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {CZECH_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousMonth}
                  disabled={loadingAvailability}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                  disabled={loadingAvailability}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Hlavička dnů */}
              {CZECH_DAYS_SHORT.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}

              {/* Kalendářní dny */}
              {calendarDays.map((calDay, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(calDay.date)}
                  disabled={calDay.isPast || !calDay.isCurrentMonth || calDay.isHoliday || !calDay.hasAvailableSlots}
                  className={cn(
                    "p-2 text-sm border rounded-lg transition-colors relative",
                    calDay.isCurrentMonth 
                      ? "text-gray-900" 
                      : "text-gray-400",
                    calDay.isToday && "font-bold border-health-primary",
                    calDay.isPast && "opacity-50 cursor-not-allowed",
                    calDay.isHoliday && "bg-red-50 text-red-700",
                    calDay.isWeekend && !calDay.isHoliday && "bg-gray-50",
                    calDay.hasAvailableSlots && !calDay.isPast && !calDay.isHoliday 
                      ? "hover:bg-health-primary/10 cursor-pointer" 
                      : "",
                    selectedDate?.toDateString() === calDay.date.toDateString() && 
                      "bg-health-primary text-white",
                    !calDay.hasAvailableSlots && !calDay.isPast && !calDay.isHoliday && 
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span>{calDay.day}</span>
                  
                  {/* Indikátory */}
                  {calDay.hasAvailableSlots && !calDay.isPast && !calDay.isHoliday && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  
                  {calDay.isHoliday && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Dostupné termíny</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Svátek</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>Nedostupné</span>
              </div>
            </div>

            {loadingAvailability && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-health-primary mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Načítám dostupnost...</p>
              </div>
            )}
          </div>

          {/* Detail a rezervace */}
          <div className="space-y-4">
            {selectedDate && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {selectedDate.toLocaleDateString('cs-CZ', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>

                  {/* Časové sloty */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Dostupné časy:</h4>
                    {availableTimeSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableTimeSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleTimeSlotSelect(`${slot.start_time} - ${slot.end_time}`)}
                            disabled={!slot.available}
                            className={cn(
                              "p-2 text-sm border rounded-lg transition-colors",
                              slot.available 
                                ? "hover:bg-health-primary/10 cursor-pointer" 
                                : "opacity-50 cursor-not-allowed bg-gray-100",
                              selectedTimeSlot === `${slot.start_time} - ${slot.end_time}` && 
                                "bg-health-primary text-white"
                            )}
                          >
                            <Clock className="w-3 h-3 inline mr-1" />
                            {slot.start_time} - {slot.end_time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        V tento den nejsou dostupné žádné termíny.
                      </p>
                    )}
                  </div>
                </div>

                {selectedTimeSlot && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">Detaily rezervace:</h4>

                    {/* Typ konzultace */}
                    <div>
                      <label className="text-sm font-medium">Typ konzultace *</label>
                      <Select value={consultationType} onValueChange={(value: ConsultationType) => setConsultationType(value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONSULTATION_TYPES.filter(type => 
                            doctor.consultation_types.includes(type.value)
                          ).map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label} ({type.duration} min)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priorita */}
                    <div>
                      <label className="text-sm font-medium">Priorita</label>
                      <Select value={priority} onValueChange={(value: AppointmentPriority) => setPriority(value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <Badge variant="secondary" className={option.color}>
                                {option.label}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Důvod návštěvy */}
                    <div>
                      <label className="text-sm font-medium">Důvod návštěvy *</label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Popište stručně důvod vaší návštěvy..."
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-health-primary focus:border-transparent"
                        rows={3}
                        maxLength={500}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {reason.length}/500 znaků
                      </div>
                    </div>

                    {/* Příznaky */}
                    <div>
                      <label className="text-sm font-medium">Příznaky (volitelné)</label>
                      <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Uveďte příznaky oddělené čárkami..."
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-health-primary focus:border-transparent"
                        rows={2}
                        maxLength={300}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {symptoms.length}/300 znaků
                      </div>
                    </div>

                    {/* Shrnutí rezervace */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <h5 className="font-medium">Shrnutí rezervace:</h5>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Lékař:</span>
                          <span>{doctor.first_name} {doctor.last_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Datum:</span>
                          <span>{selectedDate.toLocaleDateString('cs-CZ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Čas:</span>
                          <span>{selectedTimeSlot}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Typ:</span>
                          <span>{selectedConsultationType?.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Priorita:</span>
                          <Badge variant="secondary" className={selectedPriority?.color}>
                            {selectedPriority?.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Tlačítko rezervace */}
                    <Button
                      onClick={handleBookingSubmit}
                      disabled={loading || !reason.trim()}
                      className="w-full"
                      variant="health"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Rezervuji...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Rezervovat termín
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}

            {!selectedDate && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Vyberte datum pro zobrazení dostupných termínů</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}