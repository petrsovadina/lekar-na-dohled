"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Typy pro authentication
export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signUp: (email: string, password: string, userData?: UserMetadata) => Promise<AuthResponse>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResponse>
  updateUser: (userData: UserMetadata) => Promise<AuthResponse>
  refreshSession: () => Promise<void>
  isDoctor: boolean
  isPatient: boolean
  isAdmin: boolean
}

export interface AuthResponse {
  success: boolean
  error?: AuthError | null
  message?: string
}

export interface UserMetadata {
  firstName?: string
  lastName?: string
  phone?: string
  birthDate?: string
  birthNumber?: string
  insuranceNumber?: string
  insuranceProvider?: string
  userType?: 'patient' | 'doctor' | 'admin'
  // Doktoři
  licenseNumber?: string
  specialization?: string
  workingAddress?: string
  // Pacienti
  preferredLanguage?: string
  emergencyContact?: string
  allergies?: string[]
  medications?: string[]
  chronicConditions?: string[]
}

// Vytvoření context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook pro použití authentication context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// AuthProvider komponenta
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Získání aktuální session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Naslouchání změnám authentication stavu
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Funkce pro přihlášení
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return {
          success: false,
          error,
          message: getErrorMessage(error)
        }
      }

      return {
        success: true,
        message: 'Úspěšně přihlášen'
      }
    } catch (error) {
      return {
        success: false,
        error: error as AuthError,
        message: 'Neočekávaná chyba při přihlašování'
      }
    } finally {
      setLoading(false)
    }
  }

  // Funkce pro registraci
  const signUp = async (
    email: string, 
    password: string, 
    userData?: UserMetadata
  ): Promise<AuthResponse> => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      })

      if (error) {
        return {
          success: false,
          error,
          message: getErrorMessage(error)
        }
      }

      return {
        success: true,
        message: 'Registrace proběhla úspěšně. Zkontrolujte svůj email pro potvrzení.'
      }
    } catch (error) {
      return {
        success: false,
        error: error as AuthError,
        message: 'Neočekávaná chyba při registraci'
      }
    } finally {
      setLoading(false)
    }
  }

  // Funkce pro odhlášení
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Chyba při odhlašování:', error)
      }
    } catch (error) {
      console.error('Neočekávaná chyba při odhlašování:', error)
    } finally {
      setLoading(false)
    }
  }

  // Funkce pro reset hesla
  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        return {
          success: false,
          error,
          message: getErrorMessage(error)
        }
      }

      return {
        success: true,
        message: 'Odkaz pro obnovení hesla byl odeslán na váš email'
      }
    } catch (error) {
      return {
        success: false,
        error: error as AuthError,
        message: 'Neočekávaná chyba při resetování hesla'
      }
    }
  }

  // Funkce pro aktualizaci uživatele
  const updateUser = async (userData: UserMetadata): Promise<AuthResponse> => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.updateUser({
        data: userData
      })

      if (error) {
        return {
          success: false,
          error,
          message: getErrorMessage(error)
        }
      }

      return {
        success: true,
        message: 'Profil byl úspěšně aktualizován'
      }
    } catch (error) {
      return {
        success: false,
        error: error as AuthError,
        message: 'Neočekávaná chyba při aktualizaci profilu'
      }
    } finally {
      setLoading(false)
    }
  }

  // Funkce pro obnovení session
  const refreshSession = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Chyba při obnovování session:', error)
      }
    } catch (error) {
      console.error('Neočekávaná chyba při obnovování session:', error)
    }
  }

  // Pomocné funkce pro role checking
  const isDoctor = user?.user_metadata?.userType === 'doctor'
  const isPatient = user?.user_metadata?.userType === 'patient'
  const isAdmin = user?.user_metadata?.userType === 'admin'

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUser,
    refreshSession,
    isDoctor,
    isPatient,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Pomocná funkce pro převod chyb do češtiny
function getErrorMessage(error: AuthError): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Neplatné přihlašovací údaje'
    case 'User not found':
      return 'Uživatel nenalezen'
    case 'Invalid email':
      return 'Neplatný email'
    case 'Password should be at least 6 characters':
      return 'Heslo musí obsahovat alespoň 6 znaků'
    case 'Email not confirmed':
      return 'Email není potvrzeně. Zkontrolujte svou emailovou schránku.'
    case 'User already registered':
      return 'Uživatel s tímto emailem je již registrován'
    case 'Signup is disabled':
      return 'Registrace je momentálně zakázána'
    case 'Email link is invalid or has expired':
      return 'Odkaz v emailu je neplatný nebo vypršel'
    case 'Token has expired or is invalid':
      return 'Token vypršel nebo je neplatný'
    case 'New password should be different from the old password':
      return 'Nové heslo musí být odlišné od starého hesla'
    default:
      return error.message || 'Došlo k neočekávané chybě'
  }
}

// Komponenta pro protected routes
export function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback 
}: { 
  children: React.ReactNode
  requiredRole?: 'patient' | 'doctor' | 'admin'
  fallback?: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-primary"></div>
      </div>
    )
  }

  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Přihlášení vyžadováno
          </h2>
          <p className="text-gray-600">
            Pro přístup k této stránce se musíte přihlásit.
          </p>
        </div>
      </div>
    )
  }

  if (requiredRole && user.user_metadata?.userType !== requiredRole) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Nedostatečná oprávnění
          </h2>
          <p className="text-gray-600">
            Nemáte dostatečná oprávnění pro přístup k této stránce.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook pro protected actions
export function useProtectedAction() {
  const { user } = useAuth()

  return {
    requireAuth: (action: () => void) => {
      if (!user) {
        throw new Error('Přihlášení vyžadováno')
      }
      action()
    },
    requireRole: (role: 'patient' | 'doctor' | 'admin', action: () => void) => {
      if (!user) {
        throw new Error('Přihlášení vyžadováno')
      }
      if (user.user_metadata?.userType !== role) {
        throw new Error('Nedostatečná oprávnění')
      }
      action()
    }
  }
}