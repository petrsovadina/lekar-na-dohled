import CryptoJS from 'crypto-js'

// Typy pro GDPR compliance
export interface AnonymizationOptions {
  method: 'pseudonymization' | 'anonymization' | 'aggregation'
  saltKey?: string
  preserveLength?: boolean
  preserveFormat?: boolean
  replacementChar?: string
}

export interface DataRetentionPolicy {
  dataType: string
  retentionPeriod: number // ve dnech
  autoDelete: boolean
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'legitimate_interest'
  category: 'essential' | 'functional' | 'analytics' | 'marketing'
}

export interface GDPRCompliantData {
  originalData: any
  processedData: any
  anonymizationMethod: string
  timestamp: Date
  retentionUntil: Date
  canBeRestored: boolean
  metadata: Record<string, any>
}

export interface AuditLogEntry {
  id: string
  userId?: string
  action: 'consent_given' | 'consent_revoked' | 'data_access' | 'data_export' | 'data_deletion' | 'anonymization' | 'create' | 'update' | 'delete'
  dataType: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  legalBasis: string
  description: string
  metadata?: Record<string, any>
}

// Konstanta pro data retention policies (v souladu s českými zákony)
export const DATA_RETENTION_POLICIES: DataRetentionPolicy[] = [
  {
    dataType: 'health_records',
    retentionPeriod: 3650, // 10 let (zákonná povinnost)
    autoDelete: false,
    legalBasis: 'legal_obligation',
    category: 'essential'
  },
  {
    dataType: 'prescription_data',
    retentionPeriod: 1095, // 3 roky
    autoDelete: false,
    legalBasis: 'legal_obligation',
    category: 'essential'
  },
  {
    dataType: 'appointment_history',
    retentionPeriod: 1095, // 3 roky
    autoDelete: true,
    legalBasis: 'legitimate_interest',
    category: 'functional'
  },
  {
    dataType: 'chat_conversations',
    retentionPeriod: 180, // 6 měsíců
    autoDelete: true,
    legalBasis: 'consent',
    category: 'functional'
  },
  {
    dataType: 'analytics_data',
    retentionPeriod: 730, // 2 roky
    autoDelete: true,
    legalBasis: 'legitimate_interest',
    category: 'analytics'
  },
  {
    dataType: 'marketing_data',
    retentionPeriod: 730, // 2 roky
    autoDelete: true,
    legalBasis: 'consent',
    category: 'marketing'
  },
  {
    dataType: 'session_data',
    retentionPeriod: 1, // 1 den
    autoDelete: true,
    legalBasis: 'legitimate_interest',
    category: 'essential'
  }
]

// Funkce pro anonymizaci osobních údajů
export function anonymizePersonalData(
  data: any,
  options: AnonymizationOptions = { method: 'pseudonymization' }
): GDPRCompliantData {
  const timestamp = new Date()
  const retentionPolicy = getRetentionPolicy(data.dataType || 'general')
  const retentionUntil = new Date(timestamp.getTime() + (retentionPolicy.retentionPeriod * 24 * 60 * 60 * 1000))

  let processedData: any
  let canBeRestored = false

  switch (options.method) {
    case 'pseudonymization':
      processedData = pseudonymizeData(data, options)
      canBeRestored = true
      break
    case 'anonymization':
      processedData = anonymizeData(data, options)
      canBeRestored = false
      break
    case 'aggregation':
      processedData = aggregateData(data, options)
      canBeRestored = false
      break
    default:
      processedData = pseudonymizeData(data, options)
      canBeRestored = true
  }

  return {
    originalData: data,
    processedData,
    anonymizationMethod: options.method,
    timestamp,
    retentionUntil,
    canBeRestored,
    metadata: {
      saltKey: options.saltKey,
      preserveLength: options.preserveLength,
      preserveFormat: options.preserveFormat
    }
  }
}

// Pseudonymizace dat (reversible)
function pseudonymizeData(data: any, options: AnonymizationOptions): any {
  const salt = options.saltKey || process.env.GDPR_SALT_KEY || 'default-salt-key'
  
  if (typeof data === 'string') {
    return CryptoJS.AES.encrypt(data, salt).toString()
  }

  if (Array.isArray(data)) {
    return data.map(item => pseudonymizeData(item, options))
  }

  if (typeof data === 'object' && data !== null) {
    const pseudonymized: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (shouldAnonymizeField(key)) {
        pseudonymized[key] = pseudonymizeData(value, options)
      } else {
        pseudonymized[key] = value
      }
    }
    return pseudonymized
  }

  return data
}

// Anonymizace dat (irreversible)
function anonymizeData(data: any, options: AnonymizationOptions): any {
  if (typeof data === 'string') {
    if (options.preserveLength) {
      return '*'.repeat(data.length)
    }
    if (options.preserveFormat) {
      return data.replace(/[a-zA-Z]/g, 'X').replace(/[0-9]/g, '0')
    }
    return options.replacementChar || '[ANONYMIZED]'
  }

  if (Array.isArray(data)) {
    return data.map(item => anonymizeData(item, options))
  }

  if (typeof data === 'object' && data !== null) {
    const anonymized: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (shouldAnonymizeField(key)) {
        anonymized[key] = anonymizeData(value, options)
      } else {
        anonymized[key] = value
      }
    }
    return anonymized
  }

  return data
}

// Agregace dat
function aggregateData(data: any, options: AnonymizationOptions): any {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      aggregatedAt: new Date().toISOString(),
      categories: data.reduce((acc, item) => {
        const category = item.category || 'other'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})
    }
  }

  return {
    type: typeof data,
    hasValue: data !== null && data !== undefined,
    aggregatedAt: new Date().toISOString()
  }
}

// Kontrola, zda pole má být anonymizováno
function shouldAnonymizeField(fieldName: string): boolean {
  const sensitiveFields = [
    'name', 'email', 'phone', 'address', 'birthDate', 'birthNumber',
    'socialSecurityNumber', 'insuranceNumber', 'licenseNumber',
    'password', 'token', 'ip', 'userAgent', 'firstName', 'lastName',
    'personalData', 'medicalData', 'healthData', 'symptoms',
    'diagnosis', 'medication', 'treatment', 'note', 'comment'
  ]

  return sensitiveFields.some(field => 
    fieldName.toLowerCase().includes(field.toLowerCase())
  )
}

// Funkce pro dešifrování pseudonymizovaných dat
export function depseudonymizeData(
  encryptedData: string,
  saltKey?: string
): string {
  try {
    const salt = saltKey || process.env.GDPR_SALT_KEY || 'default-salt-key'
    const decrypted = CryptoJS.AES.decrypt(encryptedData, salt)
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Chyba při dešifrování dat:', error)
    return '[DECRYPT_ERROR]'
  }
}

// Funkce pro získání retention policy
export function getRetentionPolicy(dataType: string): DataRetentionPolicy {
  return DATA_RETENTION_POLICIES.find(policy => policy.dataType === dataType) || {
    dataType: 'general',
    retentionPeriod: 365,
    autoDelete: true,
    legalBasis: 'legitimate_interest',
    category: 'functional'
  }
}

// Funkce pro kontrolu, zda data jsou po expiraci
export function isDataExpired(retentionUntil: Date): boolean {
  return new Date() > retentionUntil
}

// Funkce pro automatické mazání expirovaných dat
export async function cleanupExpiredData(
  dataArray: GDPRCompliantData[]
): Promise<GDPRCompliantData[]> {
  const now = new Date()
  const activeData = dataArray.filter(data => {
    const policy = getRetentionPolicy(data.originalData.dataType)
    
    if (!policy.autoDelete) {
      return true // Nemazat data s vypnutým auto-delete
    }
    
    return data.retentionUntil > now
  })

  // Logování smazaných dat
  const deletedCount = dataArray.length - activeData.length
  if (deletedCount > 0) {
    console.log(`GDPR Cleanup: Smazáno ${deletedCount} expirovaných záznamů`)
  }

  return activeData
}

// Funkce pro validaci GDPR compliance
export function validateGDPRCompliance(data: any): {
  isCompliant: boolean
  violations: string[]
  recommendations: string[]
} {
  const violations: string[] = []
  const recommendations: string[] = []

  // Kontrola citlivých dat
  if (hasSensitiveData(data)) {
    violations.push('Nalezena nechráněná citlivá data')
    recommendations.push('Použijte anonymizaci nebo pseudonymizaci pro citlivá data')
  }

  // Kontrola retention policy
  if (!data.retentionUntil) {
    violations.push('Chybí informace o době uchovávání dat')
    recommendations.push('Nastavte retention policy pro všechna data')
  }

  // Kontrola právního základu
  if (!data.legalBasis) {
    violations.push('Chybí právní základ pro zpracování dat')
    recommendations.push('Specifikujte právní základ (consent, contract, legal_obligation, legitimate_interest)')
  }

  // Kontrola souhlasu pro zdravotní data
  if (data.dataType === 'health_records' && data.legalBasis !== 'consent') {
    violations.push('Zdravotní data vyžadují explicitní souhlas')
    recommendations.push('Získejte explicitní souhlas pro zpracování zdravotních dat')
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    recommendations
  }
}

// Funkce pro kontrolu citlivých dat
function hasSensitiveData(data: any): boolean {
  if (typeof data === 'string') {
    // Kontrola rodného čísla
    if (/^\d{6}\/\d{4}$/.test(data)) return true
    
    // Kontrola emailu
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) return true
    
    // Kontrola telefonního čísla
    if (/^\+?[0-9\s\-\(\)]{9,}$/.test(data)) return true
  }

  if (Array.isArray(data)) {
    return data.some(item => hasSensitiveData(item))
  }

  if (typeof data === 'object' && data !== null) {
    return Object.entries(data).some(([key, value]) => 
      shouldAnonymizeField(key) || hasSensitiveData(value)
    )
  }

  return false
}

// Funkce pro generování audit logu
export function createAuditLog(
  action: AuditLogEntry['action'],
  dataType: string,
  description: string,
  metadata?: Record<string, any>
): AuditLogEntry {
  return {
    id: generateId(),
    action,
    dataType,
    timestamp: new Date(),
    ipAddress: '0.0.0.0', // V reálné aplikaci by se získalo z requestu
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    legalBasis: 'consent',
    description,
    metadata
  }
}

// Funkce pro generování ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Funkce pro export dat pro GDPR žádosti
export function exportUserData(
  userData: any,
  format: 'json' | 'csv' | 'xml' = 'json'
): string {
  const exportData = {
    exportedAt: new Date().toISOString(),
    dataController: 'DoktorNaDohled.cz',
    userRights: {
      access: 'Právo na přístup k údajům',
      rectification: 'Právo na opravu údajů',
      erasure: 'Právo na výmaz údajů',
      portability: 'Právo na přenositelnost údajů',
      objection: 'Právo vznést námitku',
      restriction: 'Právo na omezení zpracování'
    },
    data: userData
  }

  switch (format) {
    case 'json':
      return JSON.stringify(exportData, null, 2)
    case 'csv':
      return convertToCSV(exportData)
    case 'xml':
      return convertToXML(exportData)
    default:
      return JSON.stringify(exportData, null, 2)
  }
}

// Pomocná funkce pro konverzi do CSV
function convertToCSV(data: any): string {
  const headers = Object.keys(data).join(',')
  const values = Object.values(data).map(value => 
    typeof value === 'object' ? JSON.stringify(value) : value
  ).join(',')
  return `${headers}\n${values}`
}

// Pomocná funkce pro konverzi do XML
function convertToXML(data: any): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<gdpr-export>\n'
  
  function objectToXML(obj: any, indent: string = '  '): string {
    let result = ''
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result += `${indent}<${key}>\n`
        result += objectToXML(value, indent + '  ')
        result += `${indent}</${key}>\n`
      } else {
        result += `${indent}<${key}>${value}</${key}>\n`
      }
    }
    return result
  }
  
  xml += objectToXML(data)
  xml += '</gdpr-export>'
  
  return xml
}

// Funkce pro maskování citlivých dat pro logování
export function maskSensitiveData(data: any): any {
  if (typeof data === 'string') {
    // Maskování emailu
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
      const [username, domain] = data.split('@')
      return `${username?.charAt(0) || 'u'}***@${domain}`
    }
    
    // Maskování telefonního čísla
    if (/^\+?[0-9\s\-\(\)]{9,}$/.test(data)) {
      return data.replace(/\d(?=\d{4})/g, '*')
    }
    
    // Maskování rodného čísla
    if (/^\d{6}\/\d{4}$/.test(data)) {
      return data.replace(/\d{6}/, '******')
    }
  }

  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item))
  }

  if (typeof data === 'object' && data !== null) {
    const masked: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (shouldAnonymizeField(key)) {
        masked[key] = maskSensitiveData(value)
      } else {
        masked[key] = value
      }
    }
    return masked
  }

  return data
}

// Funkce pro kontrolu platnosti souhlasu
export function validateConsentValidity(
  consentTimestamp: Date,
  consentType: string
): {
  isValid: boolean
  expiresAt: Date
  daysUntilExpiry: number
  requiresRenewal: boolean
} {
  const now = new Date()
  const consentAge = now.getTime() - consentTimestamp.getTime()
  const daysSinceConsent = Math.floor(consentAge / (1000 * 60 * 60 * 24))
  
  // Různé typy souhlasu mají různou dobu platnosti
  const validityPeriods: Record<string, number> = {
    'marketing': 365,        // 1 rok
    'analytics': 730,        // 2 roky
    'chat': 180,            // 6 měsíců
    'medical_data': 1095,   // 3 roky
    'functional': 730,      // 2 roky
    'essential': Infinity   // Neomezeně
  }
  
  const validityDays = validityPeriods[consentType] || 365
  const expiresAt = new Date(consentTimestamp.getTime() + (validityDays * 24 * 60 * 60 * 1000))
  const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  return {
    isValid: daysUntilExpiry > 0,
    expiresAt,
    daysUntilExpiry,
    requiresRenewal: daysUntilExpiry <= 30 // Obnovit 30 dní před expirací
  }
}