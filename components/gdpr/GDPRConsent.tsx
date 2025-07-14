"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText,
  Users,
  Database,
  Globe,
  Settings,
  X,
  Download,
  Trash2,
  Eye,
  Lock,
  UserCheck,
  Scale,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { recordGDPRConsent, revokeGDPRConsent, getGDPRConsentHistory } from '@/lib/supabase'

// Typy pro GDPR consent
export type ConsentType = 
  | 'essential'         // Nezbytné cookies/funkce
  | 'functional'        // Funkční cookies/funkce
  | 'analytics'         // Analytika a statistiky
  | 'marketing'         // Marketing a reklama
  | 'chat'              // AI chat a konverzace
  | 'medical_data'      // Zdravotní data
  | 'location'          // Geolokace
  | 'third_party'       // Třetí strany
  | 'research'          // Výzkum a studie
  | 'communication'     // Komunikace a notifikace

export interface ConsentOption {
  id: ConsentType
  title: string
  description: string
  category: 'essential' | 'functional' | 'analytics' | 'marketing'
  required: boolean
  defaultValue: boolean
  purposes: string[]
  dataTypes: string[]
  retentionPeriod: string
  thirdParties?: string[]
  legalBasis: 'consent' | 'legitimate_interest' | 'contract' | 'legal_obligation'
  consequences?: string
  riskLevel: 'low' | 'medium' | 'high'
}

export interface ConsentSettings {
  [key: string]: boolean
}

export interface ConsentHistory {
  id: string
  consentType: ConsentType
  consentGiven: boolean
  timestamp: Date
  ipAddress: string
  userAgent: string
  version: string
  metadata?: Record<string, any>
}

interface GDPRConsentProps {
  mode?: 'banner' | 'modal' | 'settings'
  onConsentChange?: (consents: ConsentSettings) => void
  showDetails?: boolean
  className?: string
}

// Definice consent možností pro česká zdravotnictví
const CONSENT_OPTIONS: ConsentOption[] = [
  {
    id: 'essential',
    title: 'Nezbytné funkce',
    description: 'Základní funkce webu a bezpečnost',
    category: 'essential',
    required: true,
    defaultValue: true,
    purposes: ['Základní funkce webu', 'Bezpečnost', 'Ověření identity'],
    dataTypes: ['Session cookies', 'Bezpečnostní tokeny'],
    retentionPeriod: 'Po dobu relace',
    legalBasis: 'legitimate_interest',
    consequences: 'Bez těchto funkcí web nebude správně fungovat',
    riskLevel: 'low'
  },
  {
    id: 'functional',
    title: 'Funkční cookies',
    description: 'Vylepšení uživatelského zážitku a personalizace',
    category: 'functional',
    required: false,
    defaultValue: false,
    purposes: ['Personalizace rozhraní', 'Jazykové preference', 'Uložení nastavení'],
    dataTypes: ['Uživatelské preference', 'Jazykové nastavení', 'Tema rozhraní'],
    retentionPeriod: '1 rok',
    legalBasis: 'consent',
    consequences: 'Bez těchto funkcí ztratíte personalizaci a nastavení',
    riskLevel: 'low'
  },
  {
    id: 'analytics',
    title: 'Analytika a statistiky',
    description: 'Pomáhá nám zlepšovat naše služby',
    category: 'analytics',
    required: false,
    defaultValue: false,
    purposes: ['Analýza návštěvnosti', 'Optimalizace webu', 'Výkonové metriky'],
    dataTypes: ['Anonymizovaná data o návštěvnosti', 'Statistiky použití'],
    retentionPeriod: '2 roky',
    legalBasis: 'legitimate_interest',
    consequences: 'Bez analytiky nemůžeme efektivně zlepšovat naše služby',
    riskLevel: 'low'
  },
  {
    id: 'chat',
    title: 'AI Chat asistent',
    description: 'Konverzace s AI asistentem pro zdravotní doporučení',
    category: 'functional',
    required: false,
    defaultValue: false,
    purposes: ['AI konverzace', 'Doporučení lékařů', 'Zdravotní poradenství'],
    dataTypes: ['Zprávy v chatu', 'Zdravotní dotazy', 'Anonymizovaná konverzace'],
    retentionPeriod: '6 měsíců',
    legalBasis: 'consent',
    consequences: 'Bez tohoto souhlasu nebude AI chat funkční',
    riskLevel: 'medium'
  },
  {
    id: 'medical_data',
    title: 'Zdravotní údaje',
    description: 'Zpracování zdravotních informací pro rezervace a konzultace',
    category: 'functional',
    required: false,
    defaultValue: false,
    purposes: ['Rezervace termínů', 'Lékařské konzultace', 'Zdravotní historie'],
    dataTypes: ['Zdravotní údaje', 'Symptomy', 'Léčebná historie', 'Léky'],
    retentionPeriod: '10 let (zákonná povinnost)',
    legalBasis: 'consent',
    consequences: 'Bez tohoto souhlasu není možné rezervovat termíny ani provádět konzultace',
    riskLevel: 'high'
  },
  {
    id: 'location',
    title: 'Geolokace',
    description: 'Určení polohy pro doporučení nejbližších lékařů',
    category: 'functional',
    required: false,
    defaultValue: false,
    purposes: ['Vyhledání nejbližších lékařů', 'Dopravní doporučení', 'Regionální služby'],
    dataTypes: ['GPS souřadnice', 'Přibližná poloha', 'Město/region'],
    retentionPeriod: '30 dní',
    legalBasis: 'consent',
    consequences: 'Bez geolokace nebudeme moci najít nejbližší lékaře',
    riskLevel: 'medium'
  },
  {
    id: 'communication',
    title: 'Komunikace a notifikace',
    description: 'Zasílání důležitých informací a připomínek',
    category: 'functional',
    required: false,
    defaultValue: false,
    purposes: ['Připomínky termínů', 'Důležité informace', 'Bezpečnostní upozornění'],
    dataTypes: ['Email adresa', 'Telefonní číslo', 'Notifikační preference'],
    retentionPeriod: '2 roky',
    legalBasis: 'consent',
    consequences: 'Bez tohoto souhlasu nedostanete důležité informace o termínech',
    riskLevel: 'low'
  },
  {
    id: 'third_party',
    title: 'Třetí strany',
    description: 'Integrace s partnerskými službami',
    category: 'marketing',
    required: false,
    defaultValue: false,
    purposes: ['Integrace s pojišťovnami', 'Platební brány', 'Mapové služby'],
    dataTypes: ['Základní údaje', 'Transakční data', 'Pojistné informace'],
    retentionPeriod: 'Podle zásad třetích stran',
    thirdParties: ['Pojišťovny', 'Platební brány', 'Google Maps'],
    legalBasis: 'consent',
    consequences: 'Bez tohoto souhlasu nebudou fungovat některé integrované služby',
    riskLevel: 'medium'
  },
  {
    id: 'research',
    title: 'Výzkum a studie',
    description: 'Anonymizované údaje pro zdravotní výzkum',
    category: 'analytics',
    required: false,
    defaultValue: false,
    purposes: ['Zdravotní výzkum', 'Epidemiologické studie', 'Zlepšování péče'],
    dataTypes: ['Anonymizovaná zdravotní data', 'Demografické údaje', 'Léčebné výsledky'],
    retentionPeriod: '15 let',
    legalBasis: 'consent',
    consequences: 'Bez tohoto souhlasu nebudete přispívat k výzkumu',
    riskLevel: 'medium'
  },
  {
    id: 'marketing',
    title: 'Marketing a reklama',
    description: 'Personalizovaný obsah a nabídky',
    category: 'marketing',
    required: false,
    defaultValue: false,
    purposes: ['Personalizovaná reklama', 'Newslettery', 'Speciální nabídky'],
    dataTypes: ['Zájmy', 'Behavioral data', 'Marketingové preference'],
    retentionPeriod: '2 roky',
    legalBasis: 'consent',
    consequences: 'Bez tohoto souhlasu nedostanete personalizovaný obsah',
    riskLevel: 'low'
  }
]

export function GDPRConsent({ 
  mode = 'banner', 
  onConsentChange,
  showDetails = false,
  className 
}: GDPRConsentProps) {
  const [consents, setConsents] = useState<ConsentSettings>({})
  const [showBanner, setShowBanner] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [consentHistory, setConsentHistory] = useState<ConsentHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'consent' | 'history' | 'rights'>('consent')

  // Inicializace consent stavu
  useEffect(() => {
    const savedConsents = localStorage.getItem('gdpr-consents')
    if (savedConsents) {
      try {
        const parsed = JSON.parse(savedConsents)
        setConsents(parsed)
      } catch (error) {
        console.error('Chyba při čtení uložených consent:', error)
      }
    } else {
      // Pokud žádné consent nejsou uloženy, zobrazit banner
      if (mode === 'banner') {
        setShowBanner(true)
      }
    }
  }, [mode])

  // Funkce pro uložení consent
  const saveConsent = async (consentType: ConsentType, granted: boolean) => {
    setLoading(true)
    try {
      await recordGDPRConsent(consentType, granted, {
        ipAddress: '0.0.0.0', // V reálné aplikaci by se získalo z requestu
        userAgent: navigator.userAgent,
        version: '1.0'
      })
      
      const newConsents = { ...consents, [consentType]: granted }
      setConsents(newConsents)
      localStorage.setItem('gdpr-consents', JSON.stringify(newConsents))
      onConsentChange?.(newConsents)
    } catch (error) {
      console.error('Chyba při ukládání consent:', error)
    } finally {
      setLoading(false)
    }
  }

  // Funkce pro změnu consent
  const handleConsentChange = (consentType: ConsentType, granted: boolean) => {
    saveConsent(consentType, granted)
  }

  // Funkce pro přijetí všech consent
  const acceptAll = () => {
    setLoading(true)
    const allConsents: ConsentSettings = {}
    
    CONSENT_OPTIONS.forEach(option => {
      allConsents[option.id] = true
      saveConsent(option.id, true)
    })
    
    setShowBanner(false)
    setShowModal(false)
    setLoading(false)
  }

  // Funkce pro odmítnutí volitelných consent
  const rejectOptional = () => {
    setLoading(true)
    const essentialConsents: ConsentSettings = {}
    
    CONSENT_OPTIONS.forEach(option => {
      const granted = option.required
      essentialConsents[option.id] = granted
      saveConsent(option.id, granted)
    })
    
    setShowBanner(false)
    setShowModal(false)
    setLoading(false)
  }

  // Funkce pro uložení vlastního nastavení
  const saveCustomSettings = () => {
    setLoading(true)
    
    Object.entries(consents).forEach(([type, granted]) => {
      saveConsent(type as ConsentType, granted)
    })
    
    setShowBanner(false)
    setShowModal(false)
    setLoading(false)
  }

  // Funkce pro načtení historie consent
  const loadConsentHistory = async () => {
    try {
      const history = await getGDPRConsentHistory()
      setConsentHistory(history)
    } catch (error) {
      console.error('Chyba při načítání historie consent:', error)
    }
  }

  // Funkce pro odvolání consent
  const handleRevokeConsent = async (consentType: ConsentType) => {
    try {
      await revokeGDPRConsent(consentType)
      handleConsentChange(consentType, false)
      await loadConsentHistory()
    } catch (error) {
      console.error('Chyba při odvolávání consent:', error)
    }
  }

  // Kategorizace consent options
  const categorizedOptions = {
    essential: CONSENT_OPTIONS.filter(opt => opt.category === 'essential'),
    functional: CONSENT_OPTIONS.filter(opt => opt.category === 'functional'),
    analytics: CONSENT_OPTIONS.filter(opt => opt.category === 'analytics'),
    marketing: CONSENT_OPTIONS.filter(opt => opt.category === 'marketing')
  }

  // Komponenta pro jednotlivé consent možnosti
  const ConsentOptionComponent = ({ option }: { option: ConsentOption }) => {
    const isGranted = consents[option.id] || false
    const riskColors = {
      low: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-red-600 bg-red-50'
    }

    return (
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900">{option.title}</h4>
              {option.required && (
                <Badge variant="destructive" className="text-xs">
                  Povinné
                </Badge>
              )}
              <Badge className={cn("text-xs", riskColors[option.riskLevel])}>
                {option.riskLevel === 'low' && 'Nízké riziko'}
                {option.riskLevel === 'medium' && 'Střední riziko'}
                {option.riskLevel === 'high' && 'Vysoké riziko'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{option.description}</p>
            
            <div className="space-y-2 text-xs text-gray-500">
              <div>
                <span className="font-medium">Účel:</span> {option.purposes.join(', ')}
              </div>
              <div>
                <span className="font-medium">Doba uchovávání:</span> {option.retentionPeriod}
              </div>
              <div>
                <span className="font-medium">Právní základ:</span> {
                  option.legalBasis === 'consent' ? 'Souhlas' :
                  option.legalBasis === 'legitimate_interest' ? 'Oprávněný zájem' :
                  option.legalBasis === 'contract' ? 'Smlouva' : 'Právní povinnost'
                }
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={isGranted}
              onCheckedChange={(checked) => handleConsentChange(option.id, checked)}
              disabled={option.required || loading}
            />
          </div>
        </div>

        {/* Rozbalitelné detaily */}
        {showDetails && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details">
              <AccordionTrigger className="text-sm py-2">
                Více informací
              </AccordionTrigger>
              <AccordionContent className="text-xs space-y-2">
                <div>
                  <span className="font-medium">Typy dat:</span> {option.dataTypes.join(', ')}
                </div>
                {option.thirdParties && (
                  <div>
                    <span className="font-medium">Třetí strany:</span> {option.thirdParties.join(', ')}
                  </div>
                )}
                {option.consequences && (
                  <div>
                    <span className="font-medium">Důsledky odmítnutí:</span> {option.consequences}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    )
  }

  // Banner režim
  if (mode === 'banner' && showBanner) {
    return (
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg",
        className
      )}>
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-health-primary" />
                <h3 className="font-semibold text-gray-900">
                  Ochrana osobních údajů
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Používáme cookies a podobné technologie pro zlepšení vašeho zážitku, 
                personalizaci obsahu a analýzu návštěvnosti. Některé údaje můžeme 
                sdílet s partnery. Kliknutím na "Přijmout vše" souhlasíte se zpracováním 
                všech typů údajů.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowModal(true)}
                size="sm"
              >
                Nastavit
              </Button>
              <Button
                variant="outline"
                onClick={rejectOptional}
                size="sm"
                disabled={loading}
              >
                Pouze nezbytné
              </Button>
              <Button
                onClick={acceptAll}
                variant="health"
                size="sm"
                disabled={loading}
              >
                Přijmout vše
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Modal režim
  const modalContent = (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('consent')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'consent' 
              ? "border-health-primary text-health-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Nastavení souhlasu
        </button>
        <button
          onClick={() => {
            setActiveTab('history')
            loadConsentHistory()
          }}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'history' 
              ? "border-health-primary text-health-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Historie
        </button>
        <button
          onClick={() => setActiveTab('rights')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'rights' 
              ? "border-health-primary text-health-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Vaše práva
        </button>
      </div>

      {/* Consent nastavení */}
      {activeTab === 'consent' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Informace o zpracování osobních údajů
                </h4>
                <p className="text-sm text-blue-800">
                  Podle GDPR máte právo rozhodnout, jak budou vaše osobní údaje zpracovávány. 
                  Můžete svůj souhlas kdykoli odvolat.
                </p>
              </div>
            </div>
          </div>

          {/* Nezbytné cookies */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Nezbytné funkce
            </h3>
            <div className="space-y-3">
              {categorizedOptions.essential.map(option => (
                <ConsentOptionComponent key={option.id} option={option} />
              ))}
            </div>
          </div>

          {/* Funkční cookies */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Funkční cookies
            </h3>
            <div className="space-y-3">
              {categorizedOptions.functional.map(option => (
                <ConsentOptionComponent key={option.id} option={option} />
              ))}
            </div>
          </div>

          {/* Analytika */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Analytika a výzkum
            </h3>
            <div className="space-y-3">
              {categorizedOptions.analytics.map(option => (
                <ConsentOptionComponent key={option.id} option={option} />
              ))}
            </div>
          </div>

          {/* Marketing */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Marketing
            </h3>
            <div className="space-y-3">
              {categorizedOptions.marketing.map(option => (
                <ConsentOptionComponent key={option.id} option={option} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Historie consent */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Historie souhlasů</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={loadConsentHistory}
            >
              Obnovit
            </Button>
          </div>
          
          <div className="space-y-3">
            {consentHistory.map(record => (
              <div key={record.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{record.consentType}</div>
                    <div className="text-sm text-gray-500">
                      {record.timestamp.toLocaleString('cs-CZ')}
                    </div>
                  </div>
                  <Badge variant={record.consentGiven ? "default" : "destructive"}>
                    {record.consentGiven ? 'Udělen' : 'Odvolán'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Práva uživatele */}
      {activeTab === 'rights' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Vaše práva podle GDPR</h3>
          
          <div className="space-y-3">
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Právo na přístup k údajům</h4>
                  <p className="text-sm text-gray-600">
                    Máte právo získat kopii svých osobních údajů, které zpracováváme.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Právo na přenositelnost</h4>
                  <p className="text-sm text-gray-600">
                    Můžete požádat o přenos svých údajů k jinému poskytovateli.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Právo na výmaz</h4>
                  <p className="text-sm text-gray-600">
                    Můžete požádat o vymazání svých osobních údajů.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">
                  Potřebujete pomoc?
                </h4>
                <p className="text-sm text-yellow-800">
                  Pro uplatnění svých práv nás kontaktujte na{' '}
                  <a href="mailto:gdpr@doktornadohled.cz" className="underline">
                    gdpr@doktornadohled.cz
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Akční tlačítka */}
      {activeTab === 'consent' && (
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={rejectOptional}
            disabled={loading}
          >
            Pouze nezbytné
          </Button>
          <Button
            onClick={acceptAll}
            disabled={loading}
          >
            Přijmout vše
          </Button>
          <Button
            onClick={saveCustomSettings}
            variant="health"
            disabled={loading}
          >
            Uložit nastavení
          </Button>
        </div>
      )}
    </div>
  )

  if (mode === 'modal') {
    return (
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogTrigger asChild>
          <Button variant="outline" className={className}>
            <Shield className="w-4 h-4 mr-2" />
            Nastavení soukromí
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-health-primary" />
              Nastavení ochrany osobních údajů
            </DialogTitle>
            <DialogDescription>
              Spravujte své preference ohledně zpracování osobních údajů
            </DialogDescription>
          </DialogHeader>
          {modalContent}
        </DialogContent>
      </Dialog>
    )
  }

  // Settings režim
  if (mode === 'settings') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-health-primary" />
            Nastavení ochrany osobních údajů
          </CardTitle>
        </CardHeader>
        <CardContent>
          {modalContent}
        </CardContent>
      </Card>
    )
  }

  return null
}