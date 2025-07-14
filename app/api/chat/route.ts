import { openai } from '@ai-sdk/openai'
import { streamText, CoreMessage } from 'ai'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  detectDangerousQuery,
  detectEmergency,
  detectSpecializationBySymptoms,
  detectRegion,
  generateHealthResponse,
  HEALTH_DISCLAIMERS,
  CZECH_MEDICAL_SPECIALIZATIONS
} from '@/lib/health/terminology'

// Konstanta pro podporované AI providery
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini'

// System prompt pro český zdravotnický AI asistent
function generateSystemPrompt(specialization?: string, region?: string): string {
  const specializationInfo = specialization && CZECH_MEDICAL_SPECIALIZATIONS[specialization] 
    ? `\n\nKONTEXT SPECIALIZACE: ${specialization}\nPopis: ${CZECH_MEDICAL_SPECIALIZATIONS[specialization].description}`
    : ''
  
  const regionInfo = region ? `\nREGION: ${region}` : ''
  
  return `Jsi AI asistent pro české zdravotnictví "DoktorNaDohled". Tvoje role je pomáhat lidem najít vhodné lékaře a poskytovat základní zdravotní informace.

KRITICKÉ PRAVIDLA:
1. NIKDY neposkytuj lékařské diagnózy ani nenavrhuj konkrétní léčbu
2. VŽDY doporuč konzultaci s kvalifikovaným lékařem
3. Používej empatický a uklidňující tón v češtině
4. Směřuj pacienty k příslušné specializaci podle příznaků
5. Nezavádějící rady - pouze obecné zdravotní informace
6. VŽDY začni zdravotnickým disclaimerem

DOSTUPNÉ SPECIALIZACE:
${Object.entries(CZECH_MEDICAL_SPECIALIZATIONS).map(([spec, data]) => 
  `• ${spec}: ${data.description}`
).join('\n')}

TVOJE ÚKOLY:
- Pomoci najít vhodnou specializaci podle příznaků
- Doporučit lékaře v daném regionu (pokud specifikován)
- Poskytnout obecné zdravotní informace
- Vysvětlit co očekávat při návštěvě lékaře
- Pomoci s přípravou na lékařskou návštěvu

FORMÁT ODPOVĚDI:
1. Zdravotnický disclaimer (povinný)
2. Analýza příznaků a doporučení specializace
3. Obecné rady pro přípravu na návštěvu
4. Mockup doporučení lékařů (pro demonstraci)

Pro doporučení lékařů používej formát:
DOCTORS_RECOMMENDATION: [{"id": "demo_id", "name": "Dr. Jan Novák", "specialization": "specializace", "city": "město", "rating": 4.5, "availability": "Volné termíny tento týden"}]${specializationInfo}${regionInfo}`
}

// Funkce pro logování zdravotních dotazů (bez osobních údajů)
function logHealthQuery(specialization: string | null, region: string | null, responseType: string) {
  console.log(`Health query - specialization: ${specialization}, region: ${region}, response_type: ${responseType}`)
}

// Funkce pro kontrol GDPR souhlasu
async function checkGDPRConsent(userId?: string): Promise<boolean> {
  if (!userId) return false
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data, error } = await supabase
      .from('gdpr_consent')
      .select('*')
      .eq('user_id', userId)
      .eq('consent_type', 'chat')
      .eq('consent_given', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    return !error && data
  } catch (error) {
    console.error('Chyba při kontrole GDPR souhlasu:', error)
    return false
  }
}

// Hlavní POST handler pro AI chat
export async function POST(req: NextRequest) {
  try {
    const { messages, userId }: { messages: CoreMessage[], userId?: string } = await req.json()
    
    // Kontrola GDPR souhlasu (v produkci by se kontrolovalo podle autentifikace)
    // if (userId && !(await checkGDPRConsent(userId))) {
    //   return Response.json(
    //     { error: 'Nemáte udělený souhlas se zpracováním údajů pro AI chat.' },
    //     { status: 403 }
    //   )
    // }
    
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage) {
      return Response.json({ error: 'Žádná zpráva nebyla poskytnutá.' }, { status: 400 })
    }
    
    // Extrakce textového obsahu ze zprávy
    const messageContent = typeof lastMessage.content === 'string' 
      ? lastMessage.content 
      : Array.isArray(lastMessage.content) 
        ? lastMessage.content.map(part => 'text' in part ? part.text : '').join(' ')
        : ''
    
    // Analýza zdravotnického dotazu pomocí nové terminologie
    const healthResponse = generateHealthResponse(messageContent)
    const specialization = detectSpecializationBySymptoms(messageContent)
    const region = detectRegion(messageContent)
    
    // Logování pro analytiku (bez osobních údajů)
    logHealthQuery(specialization, region, healthResponse.type)
    
    // Kontrola emergency situací
    if (healthResponse.type === 'emergency') {
      const emergencyResponse = `🚨 **URGENTNÍ UPOZORNĚNÍ**
      
${HEALTH_DISCLAIMERS.emergency}

Na základě vašeho dotazu doporučuji okamžitě kontaktovat zdravotnickou službu.

Pokud není situace akutní a chcete najít vhodného specialistu, mohu vám pomoci s vyhledáním. Řekněte mi, v jakém městě hledáte lékaře.`
      
      return Response.json({
        choices: [{
          message: { content: emergencyResponse },
          finish_reason: 'stop'
        }]
      })
    }
    
    // Kontrola nebezpečných dotazů
    if (healthResponse.type === 'dangerous') {
      const safetyResponse = `${healthResponse.disclaimer}

Pro vaše zdravotní obtíže se prosím obraťte na:
• **Praktického lékaře** - pro obecné zdravotní problémy
• **Pohotovost** - pro akutní stavy (tel: 155)
• **Záchrannou službu** - pro život ohrožující stavy (tel: 112)

Mohu vám pomoci najít vhodného specialistu ve vašem regionu. Řekněte mi, v jakém městě hledáte lékaře a jakou specializaci potřebujete.`
      
      return Response.json({
        choices: [{
          message: { content: safetyResponse },
          finish_reason: 'stop'
        }]
      })
    }
    
    // Příprava kontextuálního promptu pro AI
    const contextualPrompt = generateSystemPrompt(specialization || undefined, region || undefined)
    
    // Streaming AI response pomocí Vercel AI SDK
    const result = await streamText({
      model: openai(AI_MODEL) as any, // Temporary fix for version compatibility
      system: contextualPrompt,
      messages: messages,
      temperature: 0.3, // Nižší hodnota pro konzistentnější zdravotnické odpovědi
      maxTokens: 1000,
      onFinish: async (completion) => {
        // Rozšířené logování pro analytiku (bez osobních údajů)
        console.log(`AI chat dokončen - tokens: ${completion.usage?.totalTokens}, specializace: ${specialization}, region: ${region}, response_type: ${healthResponse.type}`)
        
        // V budoucnu zde bude tracking úspěšnosti doporučení lékařů
        if (completion.text.includes('DOCTORS_RECOMMENDATION')) {
          console.log('Generated doctor recommendations')
        }
      }
    })
    
    return result.toDataStreamResponse()
    
  } catch (error) {
    console.error('Chyba v AI chat API:', error)
    
    return Response.json(
      { 
        error: 'Došlo k chybě při zpracování vaší zprávy. Zkuste to prosím znovu za chvíli.',
        code: 'AI_ERROR'
      },
      { status: 500 }
    )
  }
}

// OPTIONS handler pro CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}