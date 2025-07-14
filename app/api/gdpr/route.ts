import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAuditLog, anonymizePersonalData, validateGDPRCompliance } from '@/lib/gdpr-utils'

// Supabase client pro server-side operace
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Typy pro GDPR API
interface ConsentRequest {
  userId?: string
  consentType: string
  consentGiven: boolean
  metadata?: {
    ipAddress?: string
    userAgent?: string
    version?: string
  }
}

interface ConsentHistoryParams {
  userId?: string
  consentType?: string
  limit?: number
  offset?: number
}

interface DataExportRequest {
  userId: string
  format?: 'json' | 'csv' | 'xml'
  includeMetadata?: boolean
}

interface DataDeletionRequest {
  userId: string
  dataTypes?: string[]
  reason: string
}

// GET - Získání consent historie nebo stavu
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    switch (action) {
      case 'consent-history':
        return handleGetConsentHistory(searchParams)
      case 'consent-status':
        return handleGetConsentStatus(searchParams)
      case 'data-export':
        return handleDataExport(searchParams)
      case 'compliance-check':
        return handleComplianceCheck(searchParams)
      default:
        return NextResponse.json(
          { error: 'Neplatná akce' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Chyba v GDPR GET API:', error)
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    )
  }
}

// POST - Uložení consent nebo požadavky na data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    switch (action) {
      case 'record-consent':
        return handleRecordConsent(body)
      case 'revoke-consent':
        return handleRevokeConsent(body)
      case 'data-deletion':
        return handleDataDeletion(body)
      case 'update-preferences':
        return handleUpdatePreferences(body)
      default:
        return NextResponse.json(
          { error: 'Neplatná akce' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Chyba v GDPR POST API:', error)
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    )
  }
}

// Funkce pro získání consent historie
async function handleGetConsentHistory(searchParams: URLSearchParams) {
  const userId = searchParams.get('userId')
  const consentType = searchParams.get('consentType')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  
  let query = supabase
    .from('gdpr_consent')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  if (consentType) {
    query = query.eq('consent_type', consentType)
  }
  
  const { data, error, count } = await query
  
  if (error) {
    return NextResponse.json(
      { error: 'Chyba při načítání consent historie' },
      { status: 500 }
    )
  }
  
  // Audit log
  const auditLog = createAuditLog(
    'data_access',
    'consent_history',
    `Přístup k consent historii - userId: ${userId}, type: ${consentType}`
  )
  
  await supabase.from('audit_logs').insert([auditLog])
  
  return NextResponse.json({
    success: true,
    data: data || [],
    metadata: {
      total: count || 0,
      offset,
      limit
    }
  })
}

// Funkce pro získání aktuálního stavu consent
async function handleGetConsentStatus(searchParams: URLSearchParams) {
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json(
      { error: 'userId je povinný' },
      { status: 400 }
    )
  }
  
  // Získání nejnovějších consent pro každý typ
  const { data, error } = await supabase
    .from('gdpr_consent')
    .select('consent_type, consent_given, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json(
      { error: 'Chyba při načítání consent statusu' },
      { status: 500 }
    )
  }
  
  // Skupení podle typu a vzití nejnovějšího
  const consentStatus: Record<string, any> = {}
  data?.forEach(consent => {
    if (!consentStatus[consent.consent_type]) {
      consentStatus[consent.consent_type] = {
        given: consent.consent_given,
        timestamp: consent.created_at
      }
    }
  })
  
  return NextResponse.json({
    success: true,
    data: consentStatus
  })
}

// Funkce pro export dat
async function handleDataExport(searchParams: URLSearchParams) {
  const userId = searchParams.get('userId')
  const format = searchParams.get('format') || 'json'
  
  if (!userId) {
    return NextResponse.json(
      { error: 'userId je povinný' },
      { status: 400 }
    )
  }
  
  try {
    // Získání všech uživatelských dat
    const userData = await collectUserData(userId)
    
    // Anonymizace citlivých dat
    const processedData = anonymizePersonalData(userData, {
      method: 'pseudonymization',
      preserveFormat: true
    })
    
    // Audit log
    const auditLog = createAuditLog(
      'data_export',
      'user_data',
      `Export dat pro uživatele ${userId} ve formátu ${format}`
    )
    
    await supabase.from('audit_logs').insert([auditLog])
    
    // Formátování podle požadavku
    let exportData: string
    switch (format) {
      case 'json':
        exportData = JSON.stringify(processedData, null, 2)
        break
      case 'csv':
        exportData = convertToCSV(processedData)
        break
      case 'xml':
        exportData = convertToXML(processedData)
        break
      default:
        exportData = JSON.stringify(processedData, null, 2)
    }
    
    return new Response(exportData, {
      headers: {
        'Content-Type': format === 'json' ? 'application/json' : 'text/plain',
        'Content-Disposition': `attachment; filename="user-data-${userId}.${format}"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Chyba při exportu dat:', error)
    return NextResponse.json(
      { error: 'Chyba při exportu dat' },
      { status: 500 }
    )
  }
}

// Funkce pro compliance check
async function handleComplianceCheck(searchParams: URLSearchParams) {
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json(
      { error: 'userId je povinný' },
      { status: 400 }
    )
  }
  
  try {
    // Získání uživatelských dat
    const userData = await collectUserData(userId)
    
    // Validace GDPR compliance
    const complianceResult = validateGDPRCompliance(userData)
    
    return NextResponse.json({
      success: true,
      data: complianceResult
    })
  } catch (error) {
    console.error('Chyba při compliance check:', error)
    return NextResponse.json(
      { error: 'Chyba při kontrole compliance' },
      { status: 500 }
    )
  }
}

// Funkce pro záznam consent
async function handleRecordConsent(body: ConsentRequest) {
  const { userId, consentType, consentGiven, metadata } = body
  
  if (!consentType || consentGiven === undefined) {
    return NextResponse.json(
      { error: 'consentType a consentGiven jsou povinné' },
      { status: 400 }
    )
  }
  
  const consentData = {
    user_id: userId,
    consent_type: consentType,
    consent_given: consentGiven,
    ip_address: metadata?.ipAddress || '0.0.0.0',
    user_agent: metadata?.userAgent || 'unknown',
    version: metadata?.version || '1.0',
    created_at: new Date().toISOString()
  }
  
  const { error } = await supabase
    .from('gdpr_consent')
    .insert([consentData])
  
  if (error) {
    return NextResponse.json(
      { error: 'Chyba při ukládání consent' },
      { status: 500 }
    )
  }
  
  // Audit log
  const auditLog = createAuditLog(
    consentGiven ? 'consent_given' : 'consent_revoked',
    consentType,
    `Consent ${consentGiven ? 'udělen' : 'odvolán'} pro ${consentType}`
  )
  
  await supabase.from('audit_logs').insert([auditLog])
  
  return NextResponse.json({
    success: true,
    message: 'Consent byl úspěšně zaznamenán'
  })
}

// Funkce pro odvolání consent
async function handleRevokeConsent(body: ConsentRequest) {
  const { userId, consentType } = body
  
  if (!userId || !consentType) {
    return NextResponse.json(
      { error: 'userId a consentType jsou povinné' },
      { status: 400 }
    )
  }
  
  // Záznam odvolání consent
  await handleRecordConsent({
    ...body,
    consentGiven: false
  })
  
  // Provedení cleanup akcí podle typu consent
  await performConsentCleanup(userId, consentType)
  
  return NextResponse.json({
    success: true,
    message: 'Consent byl úspěšně odvolán'
  })
}

// Funkce pro smazání dat
async function handleDataDeletion(body: DataDeletionRequest) {
  const { userId, dataTypes, reason } = body
  
  if (!userId || !reason) {
    return NextResponse.json(
      { error: 'userId a reason jsou povinné' },
      { status: 400 }
    )
  }
  
  try {
    // Audit log před smazáním
    const auditLog = createAuditLog(
      'data_deletion',
      'user_data',
      `Požadavek na smazání dat pro uživatele ${userId}, důvod: ${reason}`
    )
    
    await supabase.from('audit_logs').insert([auditLog])
    
    // Smazání dat podle typu
    if (dataTypes && dataTypes.length > 0) {
      await deleteSpecificDataTypes(userId, dataTypes)
    } else {
      await deleteAllUserData(userId)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Data byla úspěšně smazána'
    })
  } catch (error) {
    console.error('Chyba při mazání dat:', error)
    return NextResponse.json(
      { error: 'Chyba při mazání dat' },
      { status: 500 }
    )
  }
}

// Funkce pro aktualizaci preferences
async function handleUpdatePreferences(body: any) {
  const { userId, preferences } = body
  
  if (!userId || !preferences) {
    return NextResponse.json(
      { error: 'userId a preferences jsou povinné' },
      { status: 400 }
    )
  }
  
  // Aktualizace consent preferences
  for (const [consentType, granted] of Object.entries(preferences)) {
    await handleRecordConsent({
      userId,
      consentType,
      consentGiven: granted as boolean,
      metadata: {
        ipAddress: '0.0.0.0',
        userAgent: 'preferences-update',
        version: '1.0'
      }
    })
  }
  
  return NextResponse.json({
    success: true,
    message: 'Preferences byly úspěšně aktualizovány'
  })
}

// Pomocné funkce
async function collectUserData(userId: string) {
  const tables = [
    'users',
    'user_profiles',
    'gdpr_consent',
    'chat_conversations',
    'appointments',
    'medical_records'
  ]
  
  const userData: any = {}
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
      
      if (!error && data) {
        userData[table] = data
      }
    } catch (error) {
      console.error(`Chyba při načítání dat z tabulky ${table}:`, error)
    }
  }
  
  return userData
}

async function performConsentCleanup(userId: string, consentType: string) {
  const cleanupActions: Record<string, () => Promise<void>> = {
    'chat': async () => {
      await supabase
        .from('chat_conversations')
        .update({ anonymized: true })
        .eq('user_id', userId)
    },
    'analytics': async () => {
      await supabase
        .from('analytics_events')
        .delete()
        .eq('user_id', userId)
    },
    'marketing': async () => {
      await supabase
        .from('marketing_profiles')
        .delete()
        .eq('user_id', userId)
    }
  }
  
  const cleanupAction = cleanupActions[consentType]
  if (cleanupAction) {
    await cleanupAction()
  }
}

async function deleteSpecificDataTypes(userId: string, dataTypes: string[]) {
  const deletionMap: Record<string, string[]> = {
    'chat': ['chat_conversations', 'chat_messages'],
    'medical': ['medical_records', 'prescriptions'],
    'appointments': ['appointments', 'appointment_history'],
    'analytics': ['analytics_events', 'user_behavior']
  }
  
  for (const dataType of dataTypes) {
    const tables = deletionMap[dataType] || []
    
    for (const table of tables) {
      try {
        await supabase
          .from(table)
          .delete()
          .eq('user_id', userId)
      } catch (error) {
        console.error(`Chyba při mazání dat z tabulky ${table}:`, error)
      }
    }
  }
}

async function deleteAllUserData(userId: string) {
  const tables = [
    'gdpr_consent',
    'chat_conversations',
    'appointments',
    'medical_records',
    'user_profiles'
  ]
  
  for (const table of tables) {
    try {
      await supabase
        .from(table)
        .delete()
        .eq('user_id', userId)
    } catch (error) {
      console.error(`Chyba při mazání dat z tabulky ${table}:`, error)
    }
  }
  
  // Nakonec smazat uživatelský účet
  await supabase.auth.admin.deleteUser(userId)
}

function convertToCSV(data: any): string {
  const headers = Object.keys(data).join(',')
  const rows = Object.values(data).map(value => 
    typeof value === 'object' ? JSON.stringify(value) : value
  )
  return `${headers}\n${rows.join(',')}`
}

function convertToXML(data: any): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<user-data>\n'
  
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
  xml += '</user-data>'
  
  return xml
}