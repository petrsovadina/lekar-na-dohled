"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Mail, Lock, User, Heart } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, user, loading: authLoading } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  
  // Přesměrování pokud je už přihlášen
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo)
    }
  }, [user, authLoading, router, redirectTo])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const result = await signIn(email, password)
      
      if (result.success) {
        router.push(redirectTo)
      } else {
        setError(result.message || 'Chyba při přihlašování')
      }
    } catch (error) {
      setError('Neočekávaná chyba při přihlašování')
    } finally {
      setLoading(false)
    }
  }
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-primary"></div>
      </div>
    )
  }
  
  if (user) {
    return null // Redirecting
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-health-primary rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Přihlášení
          </h2>
          <p className="mt-2 text-gray-600">
            Přihlaste se ke svému účtu DoktorNaDohled
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Vstup do systému</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mailová adresa</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="váš@email.cz"
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
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Vaše heslo"
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-health-primary hover:text-health-primary/80"
                >
                  Zapomněli jste heslo?
                </Link>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full"
                variant="health"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Přihlašuji...
                  </>
                ) : (
                  'Přihlásit se'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Nebo</span>
                </div>
              </div>
            </div>

            {/* Register link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Nemáte účet?{' '}
                <Link 
                  href="/auth/register" 
                  className="font-medium text-health-primary hover:text-health-primary/80"
                >
                  Zaregistrujte se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo accounts info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Demo účty pro testování:</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div>
                <strong>Pacient:</strong> pacient@demo.cz / heslo123
              </div>
              <div>
                <strong>Lékař:</strong> lekar@demo.cz / heslo123
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              * Demo účty jsou určené pouze pro testování funkcionalit
            </p>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Přihlášením souhlasíte s našimi{' '}
            <Link href="/podminky-uziti" className="text-health-primary hover:underline">
              Podmínkami užití
            </Link>
            {' '}a{' '}
            <Link href="/ochrana-osobnich-udaju" className="text-health-primary hover:underline">
              Zásadami ochrany osobních údajů
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}