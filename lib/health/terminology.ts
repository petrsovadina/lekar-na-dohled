// České zdravotnické specializace a terminologie
export const CZECH_MEDICAL_SPECIALIZATIONS: Record<string, {
  keywords: string[],
  description: string,
  symptoms: string[]
}> = {
  'praktický lékař': {
    keywords: ['praktik', 'všeobecný', 'praktický', 'rodinný lékař', 'primární péče'],
    description: 'Všeobecný lékař pro základní zdravotní péči',
    symptoms: ['horečka', 'nachlazení', 'chřipka', 'bolest hlavy', 'únava']
  },
  'kardiolog': {
    keywords: ['srdce', 'kardio', 'srdeční', 'tlak', 'palpitace', 'arytmie'],
    description: 'Specialista na onemocnění srdce a cév',
    symptoms: ['bolest na hrudi', 'dušnost', 'vysoký tlak', 'bušení srdce', 'otoky']
  },
  'neurolog': {
    keywords: ['mozek', 'nervy', 'neurologický', 'hlavobol', 'závrať', 'migréna'],
    description: 'Specialista na onemocnění nervového systému',
    symptoms: ['bolest hlavy', 'závratě', 'třes', 'křeče', 'poruchy paměti']
  },
  'dermatolog': {
    keywords: ['kůže', 'vyrážka', 'dermato', 'dermatologický', 'ekzém', 'akné'],
    description: 'Specialista na onemocnění kůže',
    symptoms: ['vyrážka', 'svědění', 'pigmentové skvrny', 'akné', 'alergie']
  },
  'gynekolog': {
    keywords: ['gyneko', 'gynekologický', 'ženský', 'menstruace', 'těhotenství'],
    description: 'Specialista na ženské zdraví',
    symptoms: ['nepravidelná menstruace', 'bolest v podbřišku', 'výtok']
  },
  'urolog': {
    keywords: ['močové', 'urologie', 'urologický', 'prostata', 'ledviny'],
    description: 'Specialista na onemocnění močových cest',
    symptoms: ['časté močení', 'pálení při močení', 'bolest ledvin']
  },
  'ortoped': {
    keywords: ['kosti', 'klouby', 'ortopedický', 'páteř', 'zlomenina'],
    description: 'Specialista na onemocnění pohybového aparátu',
    symptoms: ['bolest zad', 'bolest kloubů', 'zranění', 'artróza']
  },
  'pediatr': {
    keywords: ['děti', 'dětský', 'pediatrický', 'kojenec', 'dítě'],
    description: 'Specialista na dětské zdraví',
    symptoms: ['horečka u dítěte', 'vývojové problémy', 'očkování']
  },
  'psychiatr': {
    keywords: ['duševní', 'psychi', 'deprese', 'úzkost', 'stres'],
    description: 'Specialista na duševní zdraví',
    symptoms: ['deprese', 'úzkost', 'nespavost', 'panické ataky']
  },
  'oftalmolog': {
    keywords: ['oči', 'zrak', 'oftalmologický', 'oční', 'brýle'],
    description: 'Specialista na onemocnění očí',
    symptoms: ['zhoršení zraku', 'bolest očí', 'zarudnutí', 'slzení']
  },
  'endokrinolog': {
    keywords: ['hormony', 'štítná žláza', 'diabetes', 'cukrovka'],
    description: 'Specialista na hormonální onemocnění',
    symptoms: ['únava', 'změny váhy', 'zvýšená žízeň', 'časté močení']
  },
  'gastroenterolog': {
    keywords: ['žaludek', 'trávení', 'střeva', 'játra', 'gastro'],
    description: 'Specialista na onemocnění trávicího systému',
    symptoms: ['bolest břicha', 'průjem', 'zácpa', 'nevolnost', 'pálení žáhy']
  },
  'pneumolog': {
    keywords: ['plíce', 'dýchání', 'astma', 'kašel', 'pneumonie'],
    description: 'Specialista na onemocnění dýchacího systému',
    symptoms: ['dušnost', 'kašel', 'bolest na hrudi při dýchání']
  },
  'onkolog': {
    keywords: ['nádor', 'rakovina', 'onkologie', 'chemoterapie'],
    description: 'Specialista na nádorová onemocnění',
    symptoms: ['nevysvětlitelný úbytek váhy', 'únava', 'bolest']
  }
}

// Rozšířené safety patterns pro nebezpečné zdravotnické dotazy
export const HEALTH_SAFETY_PATTERNS = [
  // Přímé požadavky na diagnózu
  /\b(diagnó[sz]a|diagnos[ti]kuj|co to je|mám rakovinu|je to vážné)\b/gi,
  
  // Požadavky na léčbu a předpisy
  /\b(jak se léčí|léčba|předepis|recept|lék na|medikament|tableta|dávka)\b/gi,
  
  // Dávkování a medikace
  /\b(\d+\s*mg|\d+\s*ml|kolik tablet|dávkování|užívání)\b/gi,
  
  // Nebezpečné stavy
  /\b(zemřu|smrt|sebevražda|nechci žít|bolí to hrozně|krvácím)\b/gi,
  
  // Chirurgické zákroky
  /\b(operace|chirurg|zákrok|amputace|transplantace)\b/gi,
  
  // Těhotenství a plánování rodiny
  /\b(jsem těhotná|antikoncepce|potrat|plánování rodiny)\b/gi,
  
  // Psychické problémy
  /\b(deprese je hrozná|chci umřít|mám strach|panická ataka)\b/gi
]

// Emergency keywords (vyžadují okamžitou lékařskou pomoc)
export const EMERGENCY_KEYWORDS = [
  'bolest na hrudi', 'dušnost', 'kolaps', 'bezvědomí', 'silné krvácení',
  'prudká bolest břicha', 'vysoká horečka', 'křeče', 'paralýza',
  'těžké zranění', 'otravy', 'alergická reakce'
]

// České zdravotnické disclaimery
export const HEALTH_DISCLAIMERS = {
  general: `⚠️ **Důležité upozornění**: Nejsem lékař a nemohu poskytovat lékařské diagnózy ani doporučovat léčbu. Vždy se poraďte s kvalifikovaným zdravotnickým profesionálem.`,
  
  emergency: `🚨 **UPOZORNĚNÍ**: Pokud máte akutní zdravotní potíže, okamžitě kontaktujte:
• **Záchrannou službu**: 155 nebo 112
• **Pohotovost**: Nejbližší zdravotnické zařízení
• **Praktického lékaře**: Pro neakutní stavy`,
  
  medication: `💊 **Upozornění k lékům**: Nemohu doporučovat konkrétní léky ani dávkování. Pro předpis a úpravu medikace se vždy obraťte na vašeho lékaře nebo lékárníka.`,
  
  mental_health: `🧠 **Duševní zdraví**: Pokud prožíváte vážné duševní potíže, obraťte se na:
• **Krizovou linku**: 116 111 (Linka bezpečí)
• **Psychiatra nebo psychologa**
• **Nejbližší psychiatrickou ambulanci**`
}

// Funkce pro detekci specializace podle příznaků
export function detectSpecializationBySymptoms(message: string): string | null {
  const lowerMessage = message.toLowerCase()
  
  // Hledání přímých zmínek o specializaci
  for (const [specialization, data] of Object.entries(CZECH_MEDICAL_SPECIALIZATIONS)) {
    if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return specialization
    }
  }
  
  // Hledání podle příznaků
  for (const [specialization, data] of Object.entries(CZECH_MEDICAL_SPECIALIZATIONS)) {
    if (data.symptoms.some(symptom => lowerMessage.includes(symptom))) {
      return specialization
    }
  }
  
  return null
}

// Funkce pro detekci nebezpečných dotazů
export function detectDangerousQuery(message: string): boolean {
  return HEALTH_SAFETY_PATTERNS.some(pattern => pattern.test(message))
}

// Funkce pro detekci emergency situací
export function detectEmergency(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return EMERGENCY_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
}

// Funkce pro generování vhodné odpovědi podle typu dotazu
export function generateHealthResponse(message: string): {
  type: 'safe' | 'warning' | 'emergency' | 'dangerous',
  disclaimer: string,
  specialization?: string | null
} {
  const specialization = detectSpecializationBySymptoms(message)
  
  if (detectEmergency(message)) {
    return {
      type: 'emergency',
      disclaimer: HEALTH_DISCLAIMERS.emergency,
      specialization: specialization || undefined
    }
  }
  
  if (detectDangerousQuery(message)) {
    return {
      type: 'dangerous',
      disclaimer: HEALTH_DISCLAIMERS.general,
      specialization: specialization || undefined
    }
  }
  
  if (message.toLowerCase().includes('lék') || message.toLowerCase().includes('medikament')) {
    return {
      type: 'warning',
      disclaimer: HEALTH_DISCLAIMERS.medication,
      specialization: specialization || undefined
    }
  }
  
  if (message.toLowerCase().includes('deprese') || message.toLowerCase().includes('úzkost')) {
    return {
      type: 'warning',
      disclaimer: HEALTH_DISCLAIMERS.mental_health,
      specialization: specialization || undefined
    }
  }
  
  return {
    type: 'safe',
    disclaimer: HEALTH_DISCLAIMERS.general,
    specialization: specialization || undefined
  }
}

// České regiony a kraje pro geografické vyhledávání
export const CZECH_REGIONS = {
  'Praha': ['praha', 'hlavní město'],
  'Středočeský kraj': ['středočeský', 'beroun', 'kladno', 'mladá boleslav', 'kolín'],
  'Jihočeský kraj': ['jihočeský', 'české budějovice', 'písek', 'tábor', 'jindřichův hradec'],
  'Plzeňský kraj': ['plzeňský', 'plzeň', 'klatovy', 'domažlice', 'rokycany'],
  'Karlovarský kraj': ['karlovarský', 'karlovy vary', 'sokolov', 'cheb'],
  'Ústecký kraj': ['ústecký', 'ústí nad labem', 'teplice', 'děčín', 'chomutov'],
  'Liberecký kraj': ['liberecký', 'liberec', 'jablonec', 'semily', 'česká lípa'],
  'Královéhradecký kraj': ['královéhradecký', 'hradec králové', 'pardubice', 'jičín', 'náchod'],
  'Pardubický kraj': ['pardubický', 'pardubice', 'chrudim', 'ústí nad orlicí', 'svitavy'],
  'Vysočina': ['vysočina', 'jihlava', 'pelhřimov', 'havlíčkův brod', 'třebíč'],
  'Jihomoravský kraj': ['jihomoravský', 'brno', 'blansko', 'břeclav', 'hodonín', 'vyškov', 'znojmo'],
  'Olomoucký kraj': ['olomoucký', 'olomouc', 'prostějov', 'přerov', 'šumperk', 'jeseník'],
  'Zlínský kraj': ['zlínský', 'zlín', 'kroměříž', 'uherské hradiště', 'vsetín'],
  'Moravskoslezský kraj': ['moravskoslezský', 'ostrava', 'karviná', 'frýdek-místek', 'opava', 'nový jičín']
}

// Funkce pro detekci regionu v dotazu
export function detectRegion(message: string): string | null {
  const lowerMessage = message.toLowerCase()
  
  for (const [region, cities] of Object.entries(CZECH_REGIONS)) {
    if (cities.some(city => lowerMessage.includes(city))) {
      return region
    }
  }
  
  return null
}