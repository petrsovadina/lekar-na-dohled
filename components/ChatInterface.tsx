"use client"

import { useState, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Loader2, 
  Send, 
  User, 
  Bot, 
  Heart, 
  AlertTriangle,
  CheckCircle,
  Info,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { hasGDPRConsent, recordGDPRConsent } from '@/lib/supabase'

interface Doctor {
  id: string
  name: string
  specialization: string
  city: string
  rating: number
  availability: string
}

interface ChatInterfaceProps {
  onDoctorRecommendation?: (doctors: Doctor[]) => void
  className?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    doctors?: Doctor[]
    urgency?: 'low' | 'medium' | 'high' | 'urgent'
    disclaimer?: boolean
  }
}

export function ChatInterface({ onDoctorRecommendation, className }: ChatInterfaceProps) {
  const [hasConsent, setHasConsent] = useState<boolean>(false)
  const [isCheckingConsent, setIsCheckingConsent] = useState(true)
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  // Kontrola GDPR souhlasu při načtení
  useEffect(() => {
    checkGDPRConsent()
  }, [])

  const checkGDPRConsent = async () => {
    try {
      const consent = await hasGDPRConsent('chat')
      setHasConsent(consent)
    } catch (error) {
      console.error('Chyba při kontrole GDPR souhlasu:', error)
    } finally {
      setIsCheckingConsent(false)
    }
  }

  const handleGDPRConsent = async () => {
    try {
      await recordGDPRConsent('chat', true, {
        ipAddress: '0.0.0.0', // V reálné aplikaci by se získalo z requestu
        userAgent: navigator.userAgent,
        version: '1.0'
      })
      setHasConsent(true)
    } catch (error) {
      console.error('Chyba při ukládání GDPR souhlasu:', error)
    }
  }

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Dobrý den! Jsem váš AI asistent pro zdraví. Pomohu vám najít vhodného lékaře podle vašich potřeb.

⚠️ **Důležité upozornění**: Nejsem lékař a nemohu poskytovat lékařské diagnózy ani doporučovat léčbu. Vždy se poraďte s kvalifikovaným zdravotnickým profesionálem.

Jak vám mohu pomoci? Můžete mi například říct:
• Jaké máte zdravotní obtíže
• Jakého specialistu hledáte
• V kterém městě nebo kraji
• Vaše pojišťovna (pokud chcete)`
      }
    ],
    onFinish: (message) => {
      // Zpracování dokončené AI odpovědi
      if (message.content.includes('DOCTORS_RECOMMENDATION')) {
        const doctors = extractDoctorsFromMessage(message.content)
        onDoctorRecommendation?.(doctors)
      }
    },
    onError: (error) => {
      console.error('Chyba v AI chatu:', error)
    }
  })

  // Zpracování odeslání formuláře s GDPR kontrolou
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!hasConsent) {
      alert('Pro použití AI chatu je potřeba souhlasit se zpracováním osobních údajů.')
      return
    }

    if (!input.trim()) return

    // Skrytí disclaimeru po první zprávě
    if (showDisclaimer) {
      setShowDisclaimer(false)
    }

    handleSubmit(e)
  }

  if (isCheckingConsent) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Kontroluji souhlas se zpracováním údajů...</span>
        </CardContent>
      </Card>
    )
  }

  if (!hasConsent) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-health-primary" />
            Ochrana osobních údajů (GDPR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Souhlas se zpracováním údajů pro AI chat</h4>
            <p className="text-sm text-gray-600 mb-4">
              Pro použití AI asistenta potřebujeme váš souhlas se zpracováním údajů, které budete sdílet v konverzaci. 
              Tyto údaje použijeme pouze pro poskytnutí doporučení lékařů a zlepšení našich služeb.
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Údaje se zpracovávají v souladu s GDPR</li>
              <li>• Konverzace se ukládají anonymně pro zlepšení služby</li>
              <li>• Můžete souhlas kdykoli odvolat</li>
              <li>• Žádné údaje nesdílíme s třetími stranami</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGDPRConsent} variant="health" className="flex-1">
              Souhlasím se zpracováním údajů
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => window.history.back()}>
              Zrušit
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full max-w-4xl mx-auto h-[700px] flex flex-col", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-health-primary" />
          AI Asistent pro zdraví
        </CardTitle>
        
        {showDisclaimer && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Důležité upozornění</p>
                <p className="text-yellow-700 mt-1">
                  Tento AI asistent slouží pouze k orientačnímu vyhledání lékařů. 
                  Neposkytuje lékařské diagnózy ani nenahrazuje konzultaci s kvalifikovaným lékařem.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col">
        {/* Oblast zpráv */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500 p-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              </div>
              <span>AI asistent analyzuje vaši zprávu...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 text-sm">
                  Došlo k chybě při komunikaci s AI asistentem. Zkuste to prosím znovu.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Formulář pro zadání zprávy */}
        <form onSubmit={onSubmit} className="border-t pt-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Například: 'Bolí mě hlava a mám časté závratě. Potřebuji neurologa v Praze.'"
              className="flex-1"
              disabled={isLoading}
              maxLength={500}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              variant="health"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex justify-between">
            <span>Stiskněte Enter pro odeslání</span>
            <span>{input.length}/500</span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Komponenta pro zobrazení jednotlivých zpráv
interface MessageBubbleProps {
  message: {
    id: string
    role: 'user' | 'assistant' | 'system' | 'function' | 'tool' | 'data'
    content: string
  }
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  
  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex gap-3 max-w-[85%]",
      isUser ? "ml-auto" : "mr-auto"
    )}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-health-primary/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-health-primary" />
        </div>
      )}
      
      <div className={cn(
        "rounded-lg px-4 py-3 shadow-sm",
        isUser 
          ? "bg-health-primary text-white ml-auto" 
          : "bg-gray-50 text-gray-900"
      )}>
        <div className="text-sm whitespace-pre-wrap leading-relaxed czech-text">
          {formatHealthMessage(message.content)}
        </div>
        
        {!isUser && (
          <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
            <CheckCircle className="w-3 h-3" />
            <span>AI asistent</span>
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  )
}

// Funkce pro formátování zdravotnických zpráv
function formatHealthMessage(content: string): string {
  // Odstraní technické značky pro doporučení lékařů
  let formatted = content.replace(/DOCTORS_RECOMMENDATION:.*$/g, '').trim()
  
  // Formátuje seznamy
  formatted = formatted.replace(/^• /gm, '• ')
  
  // Zvýrazní důležité informace
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '$1')
  
  return formatted
}

// Funkce pro extrakci doporučených lékařů ze zprávy
function extractDoctorsFromMessage(content: string): Doctor[] {
  // V reálné implementaci by toto extrahovalo strukturovaná data
  // z odpovědi AI nebo by AI vracelo strukturovaný JSON
  const doctorRegex = /DOCTORS_RECOMMENDATION:\s*(.+)/
  const match = content.match(doctorRegex)
  
  if (match && match[1]) {
    try {
      return JSON.parse(match[1])
    } catch (error) {
      console.error('Chyba při parsování doporučených lékařů:', error)
    }
  }
  
  return []
}