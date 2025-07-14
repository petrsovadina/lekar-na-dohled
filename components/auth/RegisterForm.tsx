"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth, UserMetadata } from './AuthProvider'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  User,
  Phone,
  Calendar,
  CreditCard,
  Heart,
  UserPlus,
  Users,
  Stethoscope,
  Shield,
  MapPin,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
  redirectTo?: string
  className?: string
}

type UserType = 'patient' | 'doctor'

const CZECH_INSURANCES = [
  { code: '111', name: 'Všeobecná zdravotní pojišťovna (VZP)' },
  { code: '201', name: 'Vojenská zdravotní pojišťovna (VOZP)' },
  { code: '205', name: 'Česká průmyslová zdravotní pojišťovna (ČPZP)' },
  { code: '207', name: 'Oborová zdravotní pojišťovna (OZP)' },
  { code: '209', name: 'Zaměstnanecká pojišťovna Škoda (ZPŠ)' },
  { code: '211', name: 'Zdravotní pojišťovna ministerstva vnitra (ZPMV)' },
  { code: '213', name: 'Revírní bratrská pokladna (RBP)' }
]

const SPECIALIZATIONS = [
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
]

export function RegisterForm({ 
  onSuccess, 
  onSwitchToLogin, 
  redirectTo = '/',
  className 
}: RegisterFormProps) {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<UserType>('patient')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    birthNumber: '',
    insuranceNumber: '',
    insuranceProvider: '',
    // Doktor specifická pole
    licenseNumber: '',
    specialization: '',
    workingAddress: '',
    // Souhlas
    termsAccepted: false,
    privacyAccepted: false,
    marketingAccepted: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signUp } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Vyplňte všechna povinná pole')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Hesla se neshodují')
      return false
    }
    
    if (formData.password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků')
      return false
    }
    
    if (!formData.termsAccepted) {
      setError('Musíte souhlasit s podmínkami použití')
      return false
    }
    
    return true
  }

  const validateStep2 = () => {
    if (!formData.firstName || !formData.lastName) {
      setError('Vyplňte jméno a příjmení')
      return false
    }
    
    if (userType === 'patient') {
      if (!formData.birthDate || !formData.insuranceProvider) {
        setError('Vyplňte datum narození a pojišťovnu')
        return false
      }
    } else {
      if (!formData.licenseNumber || !formData.specialization) {
        setError('Vyplňte číslo licence a specializaci')
        return false
      }
    }
    
    return true
  }

  const handleNextStep = () => {
    setError('')
    
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const userData: UserMetadata = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        userType: userType,
        preferredLanguage: 'cs',
        ...( userType === 'patient' ? {
          birthDate: formData.birthDate,
          birthNumber: formData.birthNumber,
          insuranceNumber: formData.insuranceNumber,
          insuranceProvider: formData.insuranceProvider
        } : {
          licenseNumber: formData.licenseNumber,
          specialization: formData.specialization,
          workingAddress: formData.workingAddress
        })
      }

      const result = await signUp(formData.email, formData.password, userData)
      
      if (result.success) {
        setSuccess('Registrace proběhla úspěšně! Zkontrolujte svůj email pro potvrzení.')
        onSuccess?.()
        
        // Přesměrování po úspěšné registraci
        setTimeout(() => {
          router.push('/auth/verify-email')
        }, 2000)
      } else {
        setError(result.message || 'Chyba při registraci')
      }
    } catch (error) {
      setError('Neočekávaná chyba při registraci')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Typ účtu</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setUserType('patient')}
            className={cn(
              "p-4 border rounded-lg transition-colors",
              userType === 'patient' 
                ? "border-health-primary bg-health-primary/5" 
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="font-medium">Pacient</div>
            <div className="text-xs text-gray-500">Vyhledávání lékařů</div>
          </button>
          <button
            type="button"
            onClick={() => setUserType('doctor')}
            className={cn(
              "p-4 border rounded-lg transition-colors",
              userType === 'doctor' 
                ? "border-health-primary bg-health-primary/5" 
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <Stethoscope className="w-6 h-6 mx-auto mb-2 text-health-primary" />
            <div className="font-medium">Lékař</div>
            <div className="text-xs text-gray-500">Správa praxe</div>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="vas@email.cz"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Heslo *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Alespoň 6 znaků"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Potvrdit heslo *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Zadejte heslo znovu"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={formData.termsAccepted}
            onCheckedChange={(checked) => handleInputChange('termsAccepted', checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Souhlasím s{' '}
            <a href="/terms" className="text-health-primary hover:underline">
              podmínkami použití
            </a>
            {' *'}
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="privacy"
            checked={formData.privacyAccepted}
            onCheckedChange={(checked) => handleInputChange('privacyAccepted', checked as boolean)}
          />
          <Label htmlFor="privacy" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Souhlasím se{' '}
            <a href="/privacy" className="text-health-primary hover:underline">
              zpracováním osobních údajů
            </a>
          </Label>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Osobní údaje</h3>
        <p className="text-sm text-gray-600">
          {userType === 'patient' 
            ? 'Zadejte své osobní údaje pro vytvoření účtu pacienta'
            : 'Zadejte své údaje pro vytvoření účtu lékaře'
          }
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Jméno *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Příjmení *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            placeholder="+420 123 456 789"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {userType === 'patient' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Datum narození *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthNumber">Rodné číslo</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="birthNumber"
                placeholder="123456/7890"
                value={formData.birthNumber}
                onChange={(e) => handleInputChange('birthNumber', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="insuranceProvider">Zdravotní pojišťovna *</Label>
            <Select
              value={formData.insuranceProvider}
              onValueChange={(value) => handleInputChange('insuranceProvider', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vyberte pojišťovnu" />
              </SelectTrigger>
              <SelectContent>
                {CZECH_INSURANCES.map(insurance => (
                  <SelectItem key={insurance.code} value={insurance.code}>
                    {insurance.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="insuranceNumber">Číslo pojištěnce</Label>
            <Input
              id="insuranceNumber"
              placeholder="123456789"
              value={formData.insuranceNumber}
              onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
            />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Číslo licence *</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="licenseNumber"
                placeholder="CZ-12345"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specializace *</Label>
            <Select
              value={formData.specialization}
              onValueChange={(value) => handleInputChange('specialization', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vyberte specializaci" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALIZATIONS.map(specialization => (
                  <SelectItem key={specialization} value={specialization}>
                    {specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workingAddress">Adresa praxe</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="workingAddress"
                placeholder="Adresa vaší praxe"
                value={formData.workingAddress}
                onChange={(e) => handleInputChange('workingAddress', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Shrnutí registrace</h3>
        <p className="text-sm text-gray-600">
          Zkontrolujte své údaje před dokončením registrace
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-health-primary/10 rounded-full flex items-center justify-center">
            {userType === 'patient' ? (
              <Users className="w-4 h-4 text-blue-600" />
            ) : (
              <Stethoscope className="w-4 h-4 text-health-primary" />
            )}
          </div>
          <div>
            <div className="font-medium">
              {userType === 'patient' ? 'Pacient' : 'Lékař'}
            </div>
            <div className="text-sm text-gray-500">
              {formData.firstName} {formData.lastName}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Email:</span>
            <div className="font-medium">{formData.email}</div>
          </div>
          <div>
            <span className="text-gray-500">Telefon:</span>
            <div className="font-medium">{formData.phone || 'Nezadáno'}</div>
          </div>
          
          {userType === 'patient' ? (
            <>
              <div>
                <span className="text-gray-500">Datum narození:</span>
                <div className="font-medium">{formData.birthDate}</div>
              </div>
              <div>
                <span className="text-gray-500">Pojišťovna:</span>
                <div className="font-medium">
                  {CZECH_INSURANCES.find(ins => ins.code === formData.insuranceProvider)?.name || formData.insuranceProvider}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-gray-500">Licence:</span>
                <div className="font-medium">{formData.licenseNumber}</div>
              </div>
              <div>
                <span className="text-gray-500">Specializace:</span>
                <div className="font-medium">{formData.specialization}</div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="marketing"
          checked={formData.marketingAccepted}
          onCheckedChange={(checked) => handleInputChange('marketingAccepted', checked as boolean)}
        />
        <Label htmlFor="marketing" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Souhlasím se zasíláním marketingových sdělení
        </Label>
      </div>
    </div>
  )

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 bg-health-primary/10 rounded-full flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-health-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          Registrace
        </CardTitle>
        <p className="text-sm text-gray-600">
          Krok {step} ze 3
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress indicator */}
        <div className="flex justify-between items-center mb-6">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                step >= stepNum
                  ? "bg-health-primary text-white"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {stepNum}
            </div>
          ))}
        </div>

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

        {/* Render current step */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={loading}
            >
              Zpět
            </Button>
          )}
          
          <div className="flex gap-2 ml-auto">
            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                variant="health"
                disabled={loading}
              >
                Pokračovat
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="health"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registruji...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Dokončit registraci
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Login odkaz */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            Už máte účet?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-health-primary hover:text-health-primary/80 font-medium transition-colors"
            >
              Přihlaste se
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}