// DoktorNaDohled - TypeScript definice pro českou zdravotnickou platformu

// ===================================================================
// ZÁKLADNÍ TYPY
// ===================================================================

export type UUID = string
export type Timestamp = string
export type EmailAddress = string
export type PhoneNumber = string
export type CzechPostalCode = string
export type BirthNumber = string
export type IcoNumber = string

// České zdravotní pojišťovny
export type InsuranceProvider = '111' | '201' | '205' | '207' | '209' | '211' | '213'

// Typy uživatelů
export type UserType = 'patient' | 'doctor' | 'admin'

// ===================================================================
// UŽIVATELSKÉ TYPY
// ===================================================================

export interface User {
  id: UUID
  email: EmailAddress
  email_confirmed_at?: Timestamp
  created_at: Timestamp
  updated_at: Timestamp
  user_metadata: UserMetadata
  app_metadata: AppMetadata
}

export interface UserMetadata {
  firstName?: string
  lastName?: string
  phone?: PhoneNumber
  userType?: UserType
  preferredLanguage?: 'cs' | 'en'
  
  // Pacient specifické údaje
  birthDate?: string
  birthNumber?: BirthNumber
  insuranceNumber?: string
  insuranceProvider?: InsuranceProvider
  emergencyContact?: string
  allergies?: string[]
  medications?: string[]
  chronicConditions?: string[]
  
  // Lékař specifické údaje
  licenseNumber?: string
  specialization?: MedicalSpecialization
  workingAddress?: string
  clkRegistration?: string
  practiceIco?: IcoNumber
}

export interface AppMetadata {
  provider?: string
  providers?: string[]
  roles?: string[]
}

export interface UserProfile {
  id: UUID
  user_id: UUID
  first_name: string
  last_name: string
  phone?: PhoneNumber
  birth_date?: string
  birth_number?: BirthNumber
  insurance_provider?: InsuranceProvider
  insurance_number?: string
  region?: CzechRegion
  user_type: UserType
  emergency_contact?: string
  allergies?: string[]
  medications?: string[]
  chronic_conditions?: string[]
  created_at: Timestamp
  updated_at: Timestamp
}

// ===================================================================
// LÉKAŘSKÉ TYPY
// ===================================================================

export type MedicalSpecialization = 
  | 'praktický lékař'
  | 'kardiolog'
  | 'neurolog'
  | 'dermatolog'
  | 'gynekolog'
  | 'urolog'
  | 'ortoped'
  | 'pediatr'
  | 'psychiatr'
  | 'oftalmolog'
  | 'endokrinolog'
  | 'gastroenterolog'
  | 'pneumolog'
  | 'onkolog'

export type CzechRegion = 
  | 'Praha'
  | 'Střední Čechy'
  | 'Jižní Čechy'
  | 'Západní Čechy'
  | 'Severní Čechy'
  | 'Východní Čechy'
  | 'Severní Morava'
  | 'Jižní Morava'

export interface Doctor {
  id: UUID
  user_id: UUID
  first_name: string
  last_name: string
  email: EmailAddress
  phone?: PhoneNumber
  specialization: MedicalSpecialization
  license_number: string
  clk_registration_number?: string
  practice_name?: string
  practice_address: string
  practice_ico?: IcoNumber
  city: string
  region: CzechRegion
  postal_code: CzechPostalCode
  latitude?: number
  longitude?: number
  accepted_insurances: InsuranceProvider[]
  languages: string[]
  is_active: boolean
  license_verified: boolean
  average_rating?: number
  total_reviews: number
  years_of_experience?: number
  education?: string[]
  certifications?: string[]
  working_hours: WorkingHours
  consultation_types: ConsultationType[]
  created_at: Timestamp
  updated_at: Timestamp
}

export interface WorkingHours {
  monday?: DaySchedule
  tuesday?: DaySchedule
  wednesday?: DaySchedule
  thursday?: DaySchedule
  friday?: DaySchedule
  saturday?: DaySchedule
  sunday?: DaySchedule
}

export interface DaySchedule {
  start: string // HH:MM format
  end: string   // HH:MM format
  breaks?: TimeSlot[]
}

export interface TimeSlot {
  start: string
  end: string
}

export type ConsultationType = 'in-person' | 'telemedicine' | 'phone' | 'chat'

// ===================================================================
// TERMÍNY A REZERVACE
// ===================================================================

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show'

export type AppointmentPriority = 'normal' | 'urgent' | 'emergency'

export interface Appointment {
  id: UUID
  doctor_id: UUID
  patient_id: UUID
  appointment_date: Timestamp
  duration_minutes: number
  consultation_type: ConsultationType
  status: AppointmentStatus
  priority: AppointmentPriority
  reason?: string
  notes?: string
  symptoms?: string[]
  diagnosis?: string
  prescription?: string
  follow_up_needed?: boolean
  follow_up_date?: Timestamp
  insurance_verified: boolean
  payment_status?: PaymentStatus
  telemedicine_link?: string
  created_at: Timestamp
  updated_at: Timestamp
  
  // Vztahy
  doctor?: Doctor
  patient?: UserProfile
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface DoctorAvailability {
  id: UUID
  doctor_id: UUID
  date: string // YYYY-MM-DD format
  day_of_week: number // 0-6 (Sunday-Saturday)
  time_slots: AvailabilitySlot[]
  is_available: boolean
  notes?: string
  created_at: Timestamp
  updated_at: Timestamp
}

export interface AvailabilitySlot {
  start_time: string // HH:MM format
  end_time: string   // HH:MM format
  is_booked: boolean
  appointment_id?: UUID
}

// ===================================================================
// CHAT A AI TYPY
// ===================================================================

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: UUID
  role: MessageRole
  content: string
  timestamp: Timestamp
  metadata?: MessageMetadata
}

export interface MessageMetadata {
  model?: string
  tokens_used?: number
  response_time?: number
  safety_check?: boolean
  medical_entities?: string[]
  sentiment?: 'positive' | 'neutral' | 'negative'
  urgency_level?: 'low' | 'medium' | 'high' | 'emergency'
}

export interface ChatConversation {
  id: UUID
  user_id: UUID
  title: string
  messages: ChatMessage[]
  is_active: boolean
  summary?: string
  medical_context?: MedicalContext
  anonymized: boolean
  created_at: Timestamp
  updated_at: Timestamp
}

export interface MedicalContext {
  symptoms?: string[]
  specialization_suggested?: MedicalSpecialization
  urgency_level?: 'low' | 'medium' | 'high' | 'emergency'
  recommended_action?: string
  follow_up_needed?: boolean
}

// ===================================================================
// GDPR A COMPLIANCE TYPY
// ===================================================================

export type ConsentType = 
  | 'essential'
  | 'analytics'
  | 'marketing'
  | 'chat'
  | 'medical_records'
  | 'appointment_history'
  | 'location_data'
  | 'third_party_sharing'
  | 'research_participation'
  | 'telemedicine'

export interface GDPRConsent {
  id: UUID
  user_id?: UUID
  consent_type: ConsentType
  consent_given: boolean
  ip_address: string
  user_agent: string
  version: string
  metadata?: ConsentMetadata
  created_at: Timestamp
}

export interface ConsentMetadata {
  source?: string
  campaign?: string
  referrer?: string
  device_type?: string
  browser?: string
}

export interface AuditLog {
  id: UUID
  user_id?: UUID
  action: AuditAction
  entity_type: string
  entity_id?: UUID
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: Timestamp
}

export type AuditAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'consent_given'
  | 'consent_revoked'
  | 'data_export'
  | 'data_deletion'
  | 'data_access'

// ===================================================================
// ZDRAVOTNÍ ZÁZNAMY
// ===================================================================

export type RecordType = 
  | 'consultation'
  | 'diagnosis'
  | 'prescription'
  | 'lab_result'
  | 'imaging'
  | 'vaccination'
  | 'surgery'
  | 'emergency'

export interface MedicalRecord {
  id: UUID
  patient_id: UUID
  doctor_id: UUID
  appointment_id?: UUID
  record_type: RecordType
  record_date: Timestamp
  diagnosis?: string
  symptoms?: string[]
  treatment?: string
  medications?: Medication[]
  notes?: string
  attachments?: string[]
  is_sensitive: boolean
  access_level: AccessLevel
  created_at: Timestamp
  updated_at: Timestamp
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration?: string
  instructions?: string
}

export type AccessLevel = 'public' | 'restricted' | 'confidential'

// ===================================================================
// HODNOCENÍ A RECENZE
// ===================================================================

export interface Review {
  id: UUID
  doctor_id: UUID
  patient_id: UUID
  appointment_id?: UUID
  rating: number // 1-5
  title?: string
  content?: string
  is_verified: boolean
  is_published: boolean
  response?: string // Doctor's response
  response_date?: Timestamp
  helpful_votes: number
  created_at: Timestamp
  updated_at: Timestamp
}

// ===================================================================
// VYHLEDÁVÁNÍ A FILTRY
// ===================================================================

export interface DoctorSearchFilters {
  specialization?: MedicalSpecialization
  region?: CzechRegion
  city?: string
  insuranceProvider?: InsuranceProvider
  consultationType?: ConsultationType
  language?: string
  availableDate?: string
  maxDistance?: number
  minRating?: number
  onlyVerified?: boolean
  sortBy?: 'distance' | 'rating' | 'experience' | 'price'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface SearchResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// ===================================================================
// API RESPONSE TYPY
// ===================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  metadata?: {
    timestamp: Timestamp
    version: string
    requestId: string
  }
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ApiError {
  code: string
  message: string
  details?: string
  validationErrors?: ValidationError[]
}

// ===================================================================
// FORMULÁŘE A VALIDACE
// ===================================================================

export interface DoctorRegistrationData {
  email: EmailAddress
  password: string
  firstName: string
  lastName: string
  phone?: PhoneNumber
  licenseNumber: string
  specialization: MedicalSpecialization
  practiceAddress: string
  city: string
  region: CzechRegion
  postalCode: CzechPostalCode
  acceptedInsurances: InsuranceProvider[]
  workingHours: WorkingHours
  consultationTypes: ConsultationType[]
}

export interface PatientRegistrationData {
  email: EmailAddress
  password: string
  firstName: string
  lastName: string
  phone?: PhoneNumber
  birthDate: string
  birthNumber?: BirthNumber
  insuranceProvider: InsuranceProvider
  insuranceNumber?: string
  region?: CzechRegion
  emergencyContact?: string
}

export interface AppointmentBookingData {
  doctorId: UUID
  appointmentDate: Timestamp
  consultationType: ConsultationType
  reason: string
  symptoms?: string[]
  priority?: AppointmentPriority
  notes?: string
}

// ===================================================================
// TELEMEDICÍNA
// ===================================================================

export interface TelemedicineSession {
  id: UUID
  appointment_id: UUID
  doctor_id: UUID
  patient_id: UUID
  session_url: string
  status: SessionStatus
  started_at?: Timestamp
  ended_at?: Timestamp
  duration_minutes?: number
  recording_url?: string
  notes?: string
  technical_issues?: string[]
  quality_rating?: number
  created_at: Timestamp
}

export type SessionStatus = 
  | 'scheduled'
  | 'waiting'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'failed'

// ===================================================================
// STATISTIKY A ANALYTICS
// ===================================================================

export interface DoctorStats {
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  averageRating: number
  totalReviews: number
  responseTime: number // in minutes
  patientsServed: number
  monthlyAppointments: MonthlyStats[]
  specializationStats: SpecializationStats
}

export interface MonthlyStats {
  month: string // YYYY-MM
  appointments: number
  revenue: number
  newPatients: number
}

export interface SpecializationStats {
  totalDoctors: number
  averageRating: number
  averageExperience: number
  mostCommonSymptoms: string[]
  averageWaitTime: number
}

export interface PlatformStats {
  totalDoctors: number
  totalPatients: number
  totalAppointments: number
  activeSessions: number
  averageRating: number
  regionDistribution: Record<CzechRegion, number>
  specializationDistribution: Record<MedicalSpecialization, number>
  insuranceDistribution: Record<InsuranceProvider, number>
}

// ===================================================================
// UTILITY TYPY
// ===================================================================

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DateRange {
  from: string
  to: string
}

export interface GeoLocation {
  latitude: number
  longitude: number
  accuracy?: number
}

// ===================================================================
// KONSTANTA TYPY
// ===================================================================

export const CZECH_INSURANCE_PROVIDERS = {
  '111': 'Všeobecná zdravotní pojišťovna České republiky',
  '201': 'Vojenská zdravotní pojišťovna České republiky',
  '205': 'Česká průmyslová zdravotní pojišťovna',
  '207': 'Oborová zdravotní pojišťovna zaměstnanců bank, pojišťoven a stavebnictví',
  '209': 'Zaměstnanecká pojišťovna Škoda',
  '211': 'Zdravotní pojišťovna ministerstva vnitra České republiky',
  '213': 'Revírní bratrská pokladna, zdravotní pojišťovna'
} as const

export const CZECH_REGIONS = [
  'Praha',
  'Střední Čechy',
  'Jižní Čechy',
  'Západní Čechy',
  'Severní Čechy',
  'Východní Čechy',
  'Severní Morava',
  'Jižní Morava'
] as const

export const MEDICAL_SPECIALIZATIONS = [
  'praktický lékař',
  'kardiolog',
  'neurolog',
  'dermatolog',
  'gynekolog',
  'urolog',
  'ortoped',
  'pediatr',
  'psychiatr',
  'oftalmolog',
  'endokrinolog',
  'gastroenterolog',
  'pneumolog',
  'onkolog'
] as const

// ===================================================================
// TYPE GUARDS
// ===================================================================

export function isValidInsuranceProvider(value: string): value is InsuranceProvider {
  return Object.keys(CZECH_INSURANCE_PROVIDERS).includes(value)
}

export function isValidRegion(value: string): value is CzechRegion {
  return CZECH_REGIONS.includes(value as CzechRegion)
}

export function isValidSpecialization(value: string): value is MedicalSpecialization {
  return MEDICAL_SPECIALIZATIONS.includes(value as MedicalSpecialization)
}

export function isValidUserType(value: string): value is UserType {
  return ['patient', 'doctor', 'admin'].includes(value)
}

// ===================================================================
// COMPONENT PROP TYPY
// ===================================================================

export interface DoctorCardProps {
  doctor: Doctor
  onBookAppointment?: (doctorId: UUID) => void
  onViewProfile?: (doctorId: UUID) => void
  showBookingButton?: boolean
  compact?: boolean
}

export interface AppointmentCardProps {
  appointment: Appointment
  userType: UserType
  onCancel?: (appointmentId: UUID) => void
  onReschedule?: (appointmentId: UUID) => void
  onJoinTelemedicine?: (appointmentId: UUID) => void
}

export interface ChatInterfaceProps {
  conversationId?: UUID
  onNewConversation?: (conversation: ChatConversation) => void
  onMessageSent?: (message: ChatMessage) => void
  disabled?: boolean
  placeholder?: string
}

export interface GDPRConsentProps {
  onConsentChange?: (consents: Record<ConsentType, boolean>) => void
  requiredConsents?: ConsentType[]
  showDetails?: boolean
}

// ===================================================================
// HOOK TYPY
// ===================================================================

export interface UseAuthReturn {
  user: User | null
  session: any
  loading: boolean
  isDoctor: boolean
  isPatient: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, userData?: UserMetadata) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserMetadata>) => Promise<{ success: boolean; error?: string }>
}

export interface UseDoctorsReturn {
  doctors: Doctor[]
  loading: boolean
  error: string | null
  searchDoctors: (filters: DoctorSearchFilters) => Promise<void>
  getDoctorById: (id: UUID) => Promise<Doctor | null>
  bookAppointment: (data: AppointmentBookingData) => Promise<{ success: boolean; error?: string }>
}

export interface UseAppointmentsReturn {
  appointments: Appointment[]
  loading: boolean
  error: string | null
  createAppointment: (data: AppointmentBookingData) => Promise<{ success: boolean; error?: string }>
  cancelAppointment: (id: UUID) => Promise<{ success: boolean; error?: string }>
  rescheduleAppointment: (id: UUID, newDate: Timestamp) => Promise<{ success: boolean; error?: string }>
}

export interface UseChatReturn {
  conversations: ChatConversation[]
  currentConversation: ChatConversation | null
  loading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  createConversation: () => Promise<ChatConversation>
  deleteConversation: (id: UUID) => Promise<void>
}

// ===================================================================
// DATABASE ROW TYPY
// ===================================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>
      }
      doctors: {
        Row: Doctor
        Insert: Omit<Doctor, 'id' | 'created_at' | 'updated_at' | 'average_rating' | 'total_reviews'>
        Update: Partial<Omit<Doctor, 'id' | 'created_at'>>
      }
      appointments: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Appointment, 'id' | 'created_at'>>
      }
      chat_conversations: {
        Row: ChatConversation
        Insert: Omit<ChatConversation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ChatConversation, 'id' | 'created_at'>>
      }
      gdpr_consent: {
        Row: GDPRConsent
        Insert: Omit<GDPRConsent, 'id' | 'created_at'>
        Update: Partial<Omit<GDPRConsent, 'id' | 'created_at'>>
      }
      medical_records: {
        Row: MedicalRecord
        Insert: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MedicalRecord, 'id' | 'created_at'>>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'helpful_votes'>
        Update: Partial<Omit<Review, 'id' | 'created_at'>>
      }
      audit_logs: {
        Row: AuditLog
        Insert: Omit<AuditLog, 'id' | 'timestamp'>
        Update: never
      }
    }
  }
}