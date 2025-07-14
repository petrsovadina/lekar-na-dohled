## FEATURE:

Vytvořit **DoktorNaDohled** - AI konverzační platformu pro zdravotnictví v České republice s následujícími hlavními funkcemi:

### Hlavní funkcionality:
- **AI konverzační rozhraní** pro vedení dialogu a rozpoznání zdravotních potřeb uživatelů
- **Inteligentní vyhledávání lékařů** podle specializace, lokality, dostupnosti a hodnocení
- **Rezervační systém** pro objednání schůzek s lékaři
- **Základní telemedicínské funkce** včetně videohovorů
- **Systém hodnocení a zpětné vazby** pro lékaře
- **Personalizovaná doporučení** zdravotnických služeb na základě individuálních potřeb

### Technologický stack:
- **Frontend**: Next.js + Tailwind CSS + Shadcn/UI + React Context API
- **Backend**: Supabase + Next.js API Routes + Python FastAPI
- **Databáze**: Supabase (PostgreSQL)
- **AI integrace**: Langchain + Vercel AI SDK + OpenAI GPT-4 + Groq
- **Deployment**: Vercel + GitHub Actions CI/CD

### Cílová skupina:
- Obyvatelé ČR hledající zdravotní služby
- Pacienti s chronickými onemocněními
- Nově přistěhovalí obyvatelé
- Starší občané a jejich pečovatelé

## EXAMPLES:

Následující příklady v `examples/` složce poskytují vzory pro implementaci:

- `examples/nextjs-setup/` - Základní Next.js projekt s Tailwind CSS a Shadcn/UI
- `examples/ai-chat/` - Implementace AI chatovacího rozhraní s Vercel AI SDK
- `examples/supabase-integration/` - Integrace s Supabase databází
- `examples/doctor-search/` - Komponenta pro vyhledávání lékařů
- `examples/booking-system/` - Rezervační systém s kalendářem
- `examples/user-auth/` - Autentifikace uživatelů přes Supabase Auth
- `examples/rating-system/` - Systém hodnocení a zpětné vazby
- `examples/telemedicine/` - Základní videohovor komponenta
- `examples/api-routes/` - Next.js API routes pro backend logiku
- `examples/data-models/` - Pydantic modely pro data validaci

## DOCUMENTATION:

### Klíčová dokumentace pro implementaci:
- **Next.js dokumentace**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Shadcn/UI**: https://ui.shadcn.com/docs
- **Supabase dokumentace**: https://supabase.com/docs
- **Vercel AI SDK**: https://sdk.vercel.ai/docs
- **Langchain dokumentace**: https://js.langchain.com/docs/
- **OpenAI API**: https://platform.openai.com/docs
- **Groq API**: https://console.groq.com/docs
- **Národní registr poskytovatelů zdravotních služeb**: https://data.gov.cz/datová-sada?iri=https://data.gov.cz/zdroj/datové-sady/00024341/aa4c99d9f1480cca59807389cf88d4dc

### Zdravotnické standardy:
- **GDPR compliance** pro zdravotní data
- **EHDS (European Health Data Space)** regulace
- **České zdravotnické standardy** a certifikace

## OTHER CONSIDERATIONS:

### Specifické požadavky:
- **GDPR compliance**: Implementovat přísnou ochranu osobních zdravotních dat
- **Bezpečnost**: End-to-end šifrování pro telemedicínské hovory
- **Výkonnost**: Optimalizace pro rychlé AI odpovědi pomocí Groq
- **Škálovatelnost**: Serverless architektura pro automatické škálování
- **Lokalizace**: Čeština jako primární jazyk, podpora diakritiky
- **Přístupnost**: WCAG 2.1 standardy pro zdravotně postižené uživatele

### Časté problémy které AI přehlíží:
- **Integrace s českým zdravotním systémem**: Nutnost zpracování specifických českých IČO a kódů
- **Právní aspekty telemedicíny**: Dodržení českých zákonů o poskytování zdravotní péče na dálku
- **Datová aktuálnost**: Automatizovaný proces aktualizace dat o lékařích z registru
- **Failover mechanismy**: Záložní systémy pro případ výpadku AI služeb
- **Monitoring zdravotních dat**: Implementace alertů pro kritické zdravotní situace
- **Interoperabilita**: Kompatibilita s existujícími zdravotnickými systémy v ČR

### MVP Roadmapa (Fáze 1):
1. Základní chatovací rozhraní s AI
2. Databáze poskytovatelů zdravotní péče
3. Základní vyhledávání a doporučování
4. Uživatelská autentifikace
5. MVP nasazení a testování