// České validátory pro zdravotnictví
import { z } from 'zod'

// Typy pro validaci
export interface ValidationResult {
  isValid: boolean
  error?: string
  details?: string
}

export interface BirthNumberInfo {
  isValid: boolean
  birthDate?: Date
  isMale?: boolean
  century?: number
  region?: string
  error?: string
}

export interface InsuranceInfo {
  isValid: boolean
  providerName?: string
  providerCode?: string
  error?: string
}

// České poštovní směrovací čísla (vzorové oblasti)
const CZECH_POSTAL_REGIONS: Record<string, string> = {
  '1': 'Praha',
  '2': 'Střední Čechy',
  '3': 'Jižní Čechy',
  '4': 'Západní Čechy',
  '5': 'Severní Čechy',
  '6': 'Východní Čechy',
  '7': 'Severní Morava',
  '8': 'Jižní Morava',
  '9': 'Speciální'
}

// České zdravotní pojišťovny
const CZECH_INSURANCE_PROVIDERS: Record<string, string> = {
  '111': 'Všeobecná zdravotní pojišťovna České republiky',
  '201': 'Vojenská zdravotní pojišťovna České republiky',
  '205': 'Česká průmyslová zdravotní pojišťovna',
  '207': 'Oborová zdravotní pojišťovna zaměstnanců bank, pojišťoven a stavebnictví',
  '209': 'Zaměstnanecká pojišťovna Škoda',
  '211': 'Zdravotní pojišťovna ministerstva vnitra České republiky',
  '213': 'Revírní bratrská pokladna, zdravotní pojišťovna'
}

// Validace rodného čísla
export function validateBirthNumber(birthNumber: string): BirthNumberInfo {
  if (!birthNumber) {
    return { isValid: false, error: 'Rodné číslo je povinné' }
  }

  // Odstranění mezer a pomlček
  const cleaned = birthNumber.replace(/[\s\-\/]/g, '')
  
  // Kontrola základního formátu
  if (!/^\d{9,10}$/.test(cleaned)) {
    return { isValid: false, error: 'Rodné číslo musí mít 9 nebo 10 číslic' }
  }

  // Rozdělení na části
  const year = parseInt(cleaned.substring(0, 2))
  const month = parseInt(cleaned.substring(2, 4))
  const day = parseInt(cleaned.substring(4, 6))
  const ext = cleaned.substring(6)

  // Určení století
  let century = 1900
  let adjustedMonth = month
  let isMale = true

  // Ženy mají k měsíci přičteno 50
  if (month > 50) {
    adjustedMonth = month - 50
    isMale = false
  }

  // Kontrola měsíce
  if (adjustedMonth < 1 || adjustedMonth > 12) {
    return { isValid: false, error: 'Neplatný měsíc v rodném čísle' }
  }

  // Určení století podle délky a roku
  if (cleaned.length === 10) {
    // Pro 10místná rodná čísla
    if (year < 54) {
      century = 2000
    } else {
      century = 1900
    }
  } else {
    // Pro 9místná rodná čísla (do roku 1953)
    century = 1900
  }

  const fullYear = century + year

  // Kontrola dne
  const daysInMonth = new Date(fullYear, adjustedMonth, 0).getDate()
  if (day < 1 || day > daysInMonth) {
    return { isValid: false, error: 'Neplatný den v rodném čísle' }
  }

  // Kontrola kontrolního součtu (pro 10místná čísla)
  if (cleaned.length === 10) {
    const checkSum = parseInt(cleaned.substring(9))
    const calculatedSum = parseInt(cleaned.substring(0, 9)) % 11
    
    if (calculatedSum !== checkSum && !(calculatedSum === 10 && checkSum === 0)) {
      return { isValid: false, error: 'Neplatný kontrolní součet' }
    }
  }

  const birthDate = new Date(fullYear, adjustedMonth - 1, day)

  // Kontrola, zda datum není v budoucnosti
  if (birthDate > new Date()) {
    return { isValid: false, error: 'Datum narození nemůže být v budoucnosti' }
  }

  // Kontrola věku (realistické rozmezí)
  const age = new Date().getFullYear() - fullYear
  if (age < 0 || age > 150) {
    return { isValid: false, error: 'Nerealistický věk' }
  }

  return {
    isValid: true,
    birthDate,
    isMale,
    century,
    region: 'Česká republika'
  }
}

// Validace IČO (Identifikační číslo organizace)
export function validateIco(ico: string): ValidationResult {
  if (!ico) {
    return { isValid: false, error: 'IČO je povinné' }
  }

  // Odstranění mezer
  const cleaned = ico.replace(/\s/g, '')
  
  // Kontrola délky
  if (!/^\d{8}$/.test(cleaned)) {
    return { isValid: false, error: 'IČO musí mít 8 číslic' }
  }

  // Kontrola kontrolního součtu
  const digits = cleaned.split('').map(Number)
  const weights = [8, 7, 6, 5, 4, 3, 2]
  
  let sum = 0
  for (let i = 0; i < 7; i++) {
    sum += digits[i] * weights[i]
  }
  
  const remainder = sum % 11
  const checkDigit = remainder < 2 ? remainder : 11 - remainder
  
  if (checkDigit !== digits[7]) {
    return { isValid: false, error: 'Neplatný kontrolní součet IČO' }
  }

  return { isValid: true }
}

// Validace čísla zdravotní pojišťovny
export function validateInsuranceNumber(insuranceCode: string): InsuranceInfo {
  if (!insuranceCode) {
    return { isValid: false, error: 'Kód pojišťovny je povinný' }
  }

  const cleaned = insuranceCode.replace(/\s/g, '')
  
  if (!/^\d{3}$/.test(cleaned)) {
    return { isValid: false, error: 'Kód pojišťovny musí mít 3 číslice' }
  }

  const providerName = CZECH_INSURANCE_PROVIDERS[cleaned]
  if (!providerName) {
    return { 
      isValid: false, 
      error: 'Neplatný kód zdravotní pojišťovny',
      details: `Platné kódy: ${Object.keys(CZECH_INSURANCE_PROVIDERS).join(', ')}`
    }
  }

  return {
    isValid: true,
    providerName,
    providerCode: cleaned
  }
}

// Validace českého telefonního čísla
export function validateCzechPhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: 'Telefonní číslo je povinné' }
  }

  // Odstranění mezer, pomlček a závorek
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  
  // Kontrola českého čísla
  const czechPatterns = [
    /^\+420[1-9]\d{8}$/, // +420 formát
    /^00420[1-9]\d{8}$/, // 00420 formát
    /^420[1-9]\d{8}$/,   // 420 formát
    /^[1-9]\d{8}$/       // místní formát
  ]

  const isValid = czechPatterns.some(pattern => pattern.test(cleaned))
  
  if (!isValid) {
    return { 
      isValid: false, 
      error: 'Neplatné české telefonní číslo',
      details: 'Formát: +420 123 456 789 nebo 123 456 789'
    }
  }

  return { isValid: true }
}

// Validace poštovního směrovacího čísla
export function validateCzechPostalCode(postalCode: string): ValidationResult {
  if (!postalCode) {
    return { isValid: false, error: 'PSČ je povinné' }
  }

  // Odstranění mezer a pomlček
  const cleaned = postalCode.replace(/[\s\-]/g, '')
  
  if (!/^\d{5}$/.test(cleaned)) {
    return { 
      isValid: false, 
      error: 'PSČ musí mít 5 číslic',
      details: 'Formát: 12345 nebo 123 45'
    }
  }

  const region = CZECH_POSTAL_REGIONS[cleaned.charAt(0)]
  if (!region) {
    return { 
      isValid: false, 
      error: 'Neplatné PSČ',
      details: 'PSČ musí začínat číslicí 1-9'
    }
  }

  return { 
    isValid: true, 
    details: `Region: ${region}`
  }
}

// Validace emailu (rozšířená pro české domény)
export function validateCzechEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email je povinný' }
  }

  // Základní regex pro email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  if (!emailRegex.test(email)) {
    return { 
      isValid: false, 
      error: 'Neplatný formát emailu',
      details: 'Formát: uzivatel@domena.cz'
    }
  }

  // Kontrola délky
  if (email.length > 254) {
    return { isValid: false, error: 'Email je příliš dlouhý' }
  }

  // Kontrola lokální části
  const [localPart, domainPart] = email.split('@')
  if (localPart.length > 64) {
    return { isValid: false, error: 'Lokální část emailu je příliš dlouhá' }
  }

  // Kontrola českých znaků (volitelné)
  const hasCzechChars = /[áčďéěíňóřšťúůýž]/.test(email.toLowerCase())
  if (hasCzechChars) {
    return { 
      isValid: false, 
      error: 'Email nesmí obsahovat česká diakritická znaménka',
      details: 'Použijte standardní ASCII znaky'
    }
  }

  return { isValid: true }
}

// Validace hesla podle českých standardů
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Heslo je povinné' }
  }

  const errors: string[] = []
  
  // Minimální délka
  if (password.length < 8) {
    errors.push('Heslo musí mít alespoň 8 znaků')
  }

  // Maximální délka
  if (password.length > 128) {
    errors.push('Heslo je příliš dlouhé (max 128 znaků)')
  }

  // Velká písmena
  if (!/[A-Z]/.test(password)) {
    errors.push('Heslo musí obsahovat alespoň jedno velké písmeno')
  }

  // Malá písmena
  if (!/[a-z]/.test(password)) {
    errors.push('Heslo musí obsahovat alespoň jedno malé písmeno')
  }

  // Číslice
  if (!/\d/.test(password)) {
    errors.push('Heslo musí obsahovat alespoň jednu číslici')
  }

  // Speciální znaky
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Heslo musí obsahovat alespoň jeden speciální znak')
  }

  // Kontrola běžných hesel
  const commonPasswords = [
    'password', 'heslo', '123456', 'qwerty', 'abc123', 
    'password123', 'heslo123', 'admin', 'root'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Heslo je příliš jednoduché')
  }

  if (errors.length > 0) {
    return { 
      isValid: false, 
      error: errors[0],
      details: errors.join(', ')
    }
  }

  return { isValid: true }
}

// Validace lékařské licence
export function validateDoctorLicense(license: string): ValidationResult {
  if (!license) {
    return { isValid: false, error: 'Číslo licence je povinné' }
  }

  // Formát: CZ-12345 nebo jen 12345
  const cleanedLicense = license.replace(/[\s\-]/g, '')
  
  // Kontrola formátu
  if (!/^(CZ)?[0-9]{4,8}$/.test(cleanedLicense)) {
    return { 
      isValid: false, 
      error: 'Neplatný formát licence',
      details: 'Formát: CZ-12345 nebo 12345'
    }
  }

  // Kontrola délky číselné části
  const numberPart = cleanedLicense.replace(/^CZ/, '')
  if (numberPart.length < 4 || numberPart.length > 8) {
    return { 
      isValid: false, 
      error: 'Číslo licence musí mít 4-8 číslic'
    }
  }

  return { isValid: true }
}

// Zod schémata pro TypeScript validaci
export const CzechValidationSchemas = {
  birthNumber: z.string().refine(
    (value) => validateBirthNumber(value).isValid,
    { message: 'Neplatné rodné číslo' }
  ),
  
  ico: z.string().refine(
    (value) => validateIco(value).isValid,
    { message: 'Neplatné IČO' }
  ),
  
  phone: z.string().refine(
    (value) => validateCzechPhone(value).isValid,
    { message: 'Neplatné telefonní číslo' }
  ),
  
  postalCode: z.string().refine(
    (value) => validateCzechPostalCode(value).isValid,
    { message: 'Neplatné PSČ' }
  ),
  
  email: z.string().refine(
    (value) => validateCzechEmail(value).isValid,
    { message: 'Neplatný email' }
  ),
  
  password: z.string().refine(
    (value) => validatePassword(value).isValid,
    { message: 'Slabé heslo' }
  ),
  
  doctorLicense: z.string().refine(
    (value) => validateDoctorLicense(value).isValid,
    { message: 'Neplatná licence' }
  ),
  
  insuranceCode: z.string().refine(
    (value) => validateInsuranceNumber(value).isValid,
    { message: 'Neplatný kód pojišťovny' }
  )
}

// Funkce pro formátování hodnot
export const CzechFormatters = {
  birthNumber: (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 6) {
      return `${cleaned.substring(0, 6)}/${cleaned.substring(6)}`
    }
    return cleaned
  },
  
  phone: (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.startsWith('420')) {
      const number = cleaned.substring(3)
      return `+420 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`
    }
    if (cleaned.length === 9) {
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`
    }
    return value
  },
  
  postalCode: (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 3) {
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`
    }
    return cleaned
  },
  
  ico: (value: string): string => {
    return value.replace(/\D/g, '').substring(0, 8)
  }
}

// Pomocná funkce pro validaci celého objektu
export function validateCzechHealthData(data: any): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {}
  
  const validators = {
    birthNumber: validateBirthNumber,
    ico: validateIco,
    phone: validateCzechPhone,
    postalCode: validateCzechPostalCode,
    email: validateCzechEmail,
    password: validatePassword,
    doctorLicense: validateDoctorLicense,
    insuranceCode: validateInsuranceNumber
  }
  
  Object.entries(validators).forEach(([field, validator]) => {
    if (data[field] !== undefined) {
      results[field] = validator(data[field])
    }
  })
  
  return results
}

// Export všech validátorů
export const CzechValidators = {
  validateBirthNumber,
  validateIco,
  validateInsuranceNumber,
  validateCzechPhone,
  validateCzechPostalCode,
  validateCzechEmail,
  validatePassword,
  validateDoctorLicense,
  validateCzechHealthData
}