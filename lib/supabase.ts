import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// =============================================
// ENVIRONMENT VALIDATION
// =============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Chybí konfiguraci Supabase. Zkontrolujte environment variables.')
}

// =============================================
// CLIENT INSTANCES
// =============================================

// Client-side Supabase client (pro komponenty)
export const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

// Server-side Supabase client (pro server components a API routes)
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Service role client (pro admin operace a RLS bypass)
export const createAdminClient = (): SupabaseClient => {
  if (!supabaseServiceKey) {
    throw new Error('Service role key není dostupný pro admin operace')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Základní anonymní client (pro veřejné API)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Accept-Language': 'cs-CZ',
      'X-Client-Info': 'doktor-na-dohled@0.1.0'
    }
  }
})

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Získá aktuálního přihlášeného uživatele
 */
export async function getCurrentUser() {
  const supabase = createBrowserClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Chyba při získávání uživatele:', error.message)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Neočekávaná chyba při získávání uživatele:', error)
    return null
  }
}

/**
 * Získá session aktuálního uživatele
 */
export async function getCurrentSession() {
  const supabase = createBrowserClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Chyba při získávání session:', error.message)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Neočekávaná chyba při získávání session:', error)
    return null
  }
}

/**
 * Zkontroluje, zda je uživatel přihlášen
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Zkontroluje, zda je uživatel lékař
 */
export async function isDoctor(): Promise<boolean> {
  const supabase = createBrowserClient()
  const user = await getCurrentUser()
  
  if (!user) return false
  
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_verified', true)
      .single()
    
    return !error && !!data
  } catch (error) {
    console.error('Chyba při kontrole role lékaře:', error)
    return false
  }
}

/**
 * Zkontroluje, zda je uživatel pacient
 */
export async function isPatient(): Promise<boolean> {
  const supabase = createBrowserClient()
  const user = await getCurrentUser()
  
  if (!user) return false
  
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .eq('gdpr_consent', true)
      .single()
    
    return !error && !!data
  } catch (error) {
    console.error('Chyba při kontrole role pacienta:', error)
    return false
  }
}

/**
 * Získá profil lékaře pro aktuálního uživatele
 */
export async function getDoctorProfile() {
  const supabase = createBrowserClient()
  const user = await getCurrentUser()
  
  if (!user) return null
  
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Chyba při načítání profilu lékaře: ${error.message}`)
    }
    
    return data
  } catch (error) {
    console.error('Chyba při získávání profilu lékaře:', error)
    return null
  }
}

/**
 * Získá profil pacienta pro aktuálního uživatele
 */
export async function getPatientProfile() {
  const supabase = createBrowserClient()
  const user = await getCurrentUser()
  
  if (!user) return null
  
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Chyba při načítání profilu pacienta: ${error.message}`)
    }
    
    return data
  } catch (error) {
    console.error('Chyba při získávání profilu pacienta:', error)
    return null
  }
}

// =============================================
// GDPR COMPLIANCE HELPERS
// =============================================

/**
 * Zkontroluje GDPR souhlas pro konkrétní typ
 */
export async function hasGDPRConsent(consentType: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const user = await getCurrentUser()
  
  if (!user) return false
  
  try {
    const { data, error } = await supabase
      .from('gdpr_consents')
      .select('consented')
      .eq('user_id', user.id)
      .eq('consent_type', consentType)
      .eq('consented', true)
      .is('withdrawal_date', null)
      .single()
    
    return !error && !!data
  } catch (error) {
    console.error('Chyba při kontrole GDPR souhlasu:', error)
    return false
  }
}

/**
 * Uloží GDPR souhlas
 */
export async function recordGDPRConsent(
  consentType: string, 
  consented: boolean,
  metadata?: Record<string, any>
): Promise<boolean> {
  const supabase = createBrowserClient()
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Uživatel není přihlášen')
  }
  
  try {
    const { error } = await supabase
      .from('gdpr_consents')
      .insert({
        user_id: user.id,
        consent_type: consentType,
        consented,
        consent_date: new Date().toISOString(),
        ip_address: metadata?.ipAddress,
        user_agent: metadata?.userAgent,
        consent_version: metadata?.version || '1.0'
      })
    
    if (error) {
      throw new Error(`Chyba při ukládání GDPR souhlasu: ${error.message}`)
    }
    
    return true
  } catch (error) {
    console.error('Chyba při ukládání GDPR souhlasu:', error)
    return false
  }
}

/**
 * Odvolá GDPR souhlas
 */
export async function revokeGDPRConsent(consentType: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Uživatel není přihlášen')
  }
  
  try {
    const { error } = await supabase
      .from('gdpr_consents')
      .update({ 
        withdrawal_date: new Date().toISOString() 
      })
      .eq('user_id', user.id)
      .eq('consent_type', consentType)
      .eq('consented', true)
      .is('withdrawal_date', null)
    
    if (error) {
      throw new Error(`Chyba při odvolávání GDPR souhlasu: ${error.message}`)
    }
    
    return true
  } catch (error) {
    console.error('Chyba při odvolávání GDPR souhlasu:', error)
    return false
  }
}

/**
 * Získá historii GDPR souhlasů uživatele
 */
export async function getGDPRConsentHistory(userId?: string): Promise<any[]> {
  const supabase = createBrowserClient()
  const user = userId ? { id: userId } : await getCurrentUser()
  
  if (!user) {
    throw new Error('Uživatel není přihlášen')
  }
  
  try {
    const { data, error } = await supabase
      .from('gdpr_consents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Chyba při načítání historie GDPR souhlasů: ${error.message}`)
    }
    
    return data || []
  } catch (error) {
    console.error('Chyba při načítání historie GDPR souhlasů:', error)
    return []
  }
}

// =============================================
// ERROR HANDLING
// =============================================

/**
 * Zpracuje Supabase chyby a vrátí české chybové zprávy
 */
export function handleSupabaseError(error: any): string {
  if (!error) return 'Neznámá chyba'
  
  // Mapování častých Supabase chyb na české zprávy
  const errorMap: Record<string, string> = {
    'PGRST116': 'Záznam nebyl nalezen',
    'PGRST204': 'Žádná data nebyla nalezena',
    '23505': 'Tento záznam již existuje',
    '23503': 'Nelze smazat - existují závislé záznamy',
    '23502': 'Povinné pole není vyplněno',
    '42501': 'Nemáte oprávnění k této operaci',
    'invalid_credentials': 'Neplatné přihlašovací údaje',
    'email_not_confirmed': 'E-mail nebyl potvrzen',
    'weak_password': 'Heslo je příliš slabé',
    'signup_disabled': 'Registrace je zakázána',
    'email_address_invalid': 'Neplatná e-mailová adresa',
    'password_too_short': 'Heslo je příliš krátké',
    'user_already_exists': 'Uživatel s tímto e-mailem již existuje'
  }
  
  // Specifické chyby pro českou validaci
  if (error.message?.includes('Neplatné IČO')) {
    return 'IČO má neplatný formát nebo kontrolní součet'
  }
  
  if (error.message?.includes('Neplatné rodné číslo')) {
    return 'Rodné číslo má neplatný formát nebo kontrolní součet'
  }
  
  // Hledání podle kódu chyby
  if (error.code && errorMap[error.code]) {
    return errorMap[error.code] || 'Neznámá chyba'
  }
  
  // Hledání podle zprávy
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.message?.includes(key)) {
      return value
    }
  }
  
  // Fallback na originální zprávu nebo obecnou chybu
  return error.message || 'Došlo k neočekávané chybě'
}

/**
 * Wrapper pro Supabase operace s automatickým error handlingem
 */
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T; error: any }>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await operation()
    
    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error)
      }
    }
    
    return {
      data,
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error)
    }
  }
}

// =============================================
// UTILITIES
// =============================================

/**
 * Vyčistí cache Supabase klienta
 */
export function clearSupabaseCache() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sb-doktor-na-dohled-auth-token')
    sessionStorage.clear()
  }
}

/**
 * Nastaví české locale pro Supabase operace
 */
export function setLocale(client: SupabaseClient) {
  // Nastaví locale pro formátování dat a chybových zpráv
  return client
}

// Export hlavních instancí
export { supabase as default }

// Export typů pro TypeScript
export type { SupabaseClient } from '@supabase/supabase-js'