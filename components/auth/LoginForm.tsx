"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from './AuthProvider'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  UserPlus,
  LogIn,
  Heart,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
  redirectTo?: string
  className?: string
}

export function LoginForm({ 
  onSuccess, 
  onSwitchToRegister, 
  redirectTo = '/',
  className 
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const { signIn, resetPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const result = await signIn(email, password)
      
      if (result.success) {
        setSuccess('Úspěšně přihlášen!')
        onSuccess?.()
        
        // Přesměrování po úspěšném přihlášení
        setTimeout(() => {
          router.push(redirectTo)
        }, 1000)
      } else {
        setError(result.message || 'Chyba při přihlašování')
      }
    } catch (error) {
      setError('Neočekávaná chyba při přihlašování')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Zadejte prosím svůj email')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await resetPassword(email)
      
      if (result.success) {
        setResetEmailSent(true)
        setSuccess('Odkaz pro obnovení hesla byl odeslán na váš email')
      } else {
        setError(result.message || 'Chyba při odesílání odkazu')
      }
    } catch (error) {
      setError('Neočekávaná chyba při odesílání odkazu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 bg-health-primary/10 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-health-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          Přihlášení
        </CardTitle>
        <p className="text-sm text-gray-600">
          Přihlaste se do svého účtu DoktorNaDohled
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Alert zprávy */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">{success}</span>
            </div>
          </div>
        )}

        {resetEmailSent && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Zkontrolujte svou emailovou schránku a klikněte na odkaz pro obnovení hesla.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="vas@email.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password">Heslo</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Vaše heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Forgot password link */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-health-primary hover:text-health-primary/80 transition-colors"
              disabled={loading}
            >
              Zapomenuté heslo?
            </button>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full"
            variant="health"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Přihlašuji...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Přihlásit se
              </>
            )}
          </Button>
        </form>

        {/* Separátor */}
        <div className="relative">
          <Separator />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white px-2 text-sm text-gray-500">
              nebo
            </span>
          </div>
        </div>

        {/* Registrace odkaz */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Nemáte účet?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-health-primary hover:text-health-primary/80 font-medium transition-colors"
            >
              Zaregistrujte se
            </button>
          </p>
        </div>

        {/* Informace o typu účtu */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Typy účtů
            </h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3 text-center">
              <UserPlus className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-sm font-medium text-gray-900">Pacient</div>
              <div className="text-xs text-gray-500">Vyhledávání lékařů</div>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <Heart className="w-6 h-6 text-health-primary mx-auto mb-1" />
              <div className="text-sm font-medium text-gray-900">Lékař</div>
              <div className="text-xs text-gray-500">Správa praxe</div>
            </div>
          </div>
        </div>

        {/* Footer informace */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-gray-500">
            Přihlášením souhlasíte s našimi{' '}
            <a href="/terms" className="text-health-primary hover:underline">
              Podmínkami použití
            </a>
            {' '}a{' '}
            <a href="/privacy" className="text-health-primary hover:underline">
              Zásadami ochrany soukromí
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Komponenta pro rychlé přihlášení (pro demo účely)
export function QuickLoginDemo() {
  const { signIn } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDemoLogin = async (userType: 'patient' | 'doctor') => {
    setLoading(userType)
    
    const demoAccounts = {
      patient: {
        email: 'pacient@demo.cz',
        password: 'demo123456'
      },
      doctor: {
        email: 'doktor@demo.cz',
        password: 'demo123456'
      }
    }

    try {
      const account = demoAccounts[userType]
      await signIn(account.email, account.password)
    } catch (error) {
      console.error('Chyba při demo přihlášení:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-center text-lg">
          Demo přihlášení
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={() => handleDemoLogin('patient')}
          variant="outline"
          className="w-full"
          disabled={loading !== null}
        >
          {loading === 'patient' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4 mr-2" />
          )}
          Přihlásit jako pacient
        </Button>
        
        <Button
          onClick={() => handleDemoLogin('doctor')}
          variant="outline"
          className="w-full"
          disabled={loading !== null}
        >
          {loading === 'doctor' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Heart className="w-4 h-4 mr-2" />
          )}
          Přihlásit jako lékař
        </Button>
      </CardContent>
    </Card>
  )
}