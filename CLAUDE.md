# CLAUDE.md - Pravidla pro DoktorNaDohled

## 🏥 Kontext projektu
**DoktorNaDohled** je AI konverzační platforma pro české zdravotnictví. 
Cíl: Zlepšit dostupnost zdravotní péče prostřednictvím inteligentního vyhledávání lékařů.

### 🔄 Project Awareness & Context
- **Vždy čti `PLANNING.md`** na začátku nové konverzace pro pochopení architektury
- **Kontroluj `TASK.md`** před začátkem nového úkolu
- **Používej konzistentní pojmenování** podle `PLANNING.md`
- **Používej `npm run dev`** pro vývoj (Next.js projekt)

### 🧱 Architektura & Stack
- **Frontend**: Next.js 14+ s App Router
- **Styling**: Tailwind CSS + Shadcn/UI komponenty
- **Databáze**: Supabase (PostgreSQL)
- **AI**: Vercel AI SDK + OpenAI GPT-4 + Groq
- **Auth**: Supabase Auth
- **Deployment**: Vercel

### 🇨🇿 České zdravotnictví - Specifika
- **Používej pouze český jazyk** v UI a komunikaci
- **Respektuj české zdravotní standardy**: IČO, licence ČLK, rodná čísla
- **Implementuj česká pojišťovna enum**: VZP (111), VOZP (201), atd.
- **Dodržuj české formáty**: telefon (+420), PSČ (12345)
- **Používej české specializace**: praktický lékař, kardiolog, atd.

### 🔐 GDPR & Bezpečnost 
- **KRITICKÉ**: Všechna zdravotní data musí být GDPR compliant
- **Šifrování**: End-to-end pro telemedicínské hovory
- **Consent**: Explicitní souhlas se zpracováním zdravotních dat
- **Anonymizace**: Logování bez osobních údajů
- **Retention**: Automatické mazání dat po stanovené době
### 🧪 Testing & Validace
- **Pytest** pro Python backend komponenty
- **Jest/Vitest** pro JavaScript/TypeScript testy
- **Playwright** pro E2E testy zdravotnických workflow
- **Testuj zdravotnické scénáře**: vyhledávání lékařů, rezervace, AI chat
- **Mock API calls** k externím zdravotnickým systémům

### 📋 Kódovací standardy
- **TypeScript strict mode** - vždy type safety
- **Pydantic modely** pro validaci zdravotních dat
- **Error handling**: Graceful degradation při výpadku AI
- **Loading states**: Indikátory při AI zpracování
- **Accessibility**: WCAG 2.1 pro zdravotně postižené

### 🎯 AI Chování
- **Nikdy nediagnostikuj** ani nepředepisuj léčbu
- **Vždy doporuč konzultaci** s kvalifikovaným lékařem
- **Používej empatický tón** při zdravotnických dotazech
- **Směřuj k příslušné specializaci** podle symptomů
- **Nezavádějící rady**: Pouze obecné zdravotní informace

### 📚 Dokumentace
- **JSDoc** pro všechny funkce
- **README.md** s setup instrukcemi pro české vývojáře
- **API dokumentace** s příklady zdravotnických dotazů
- **Komentáře v češtině** pro business logiku

### 🚨 Kritické - Nedělej nikdy
- **Neukládej hesla** v plain textu
- **Neloguj zdravotní data** do konzole
- **Necachuj osobní údaje** bez GDPR souhlasu
- **Nepoužívej AI** pro diagnózy nebo předpisy
- **Nesdílej** rodná čísla nebo citlivé identifikátory

### 🔄 Workflow
1. **Čti kontext** z examples/ před implementací
2. **Následuj vzory** z existujícího kódu
3. **Testuj lokálně** před commitem
4. **Dokumentuj změny** v README
5. **Kontroluj GDPR** compliance u nových funkcí

### 📞 Kontakt & Podpora
Pro otázky k českému zdravotnickému systému konzultuj:
- Národní registr poskytovatelů (data.gov.cz)
- České zdravotnické standardy
- GDPR guidelines pro zdravotnictví