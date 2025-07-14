# 🏥 DoktorNaDohled

**AI konverzační platforma pro české zdravotnictví**

DoktorNaDohled je moderní webová aplikace navržená pro zlepšení dostupnosti zdravotní péče v České republice prostřednictvím inteligentního vyhledávání lékařů a AI asistenta.

## ✨ Hlavní funkce

- 🔍 **Inteligentní vyhledávání lékařů** podle specializace, lokality a dostupnosti
- 🤖 **AI zdravotní asistent** pro základní konzultace a směrování
- 📅 **Online rezervace** termínů u lékařů
- 🏥 **Databáze poskytovatelů** s aktuálními informacemi
- 🔐 **GDPR compliant** zpracování zdravotních dat
- 🇨🇿 **Plná lokalizace** pro český trh

## 🚀 Technologie

- **Frontend**: Next.js 14 s App Router
- **Styling**: Tailwind CSS + Shadcn/UI
- **Databáze**: Supabase (PostgreSQL)
- **AI**: Vercel AI SDK + OpenAI GPT-4 + Groq
- **Autentifikace**: Supabase Auth
- **Deployment**: Vercel
- **Testování**: Jest, Playwright, Pytest

## 📋 Požadavky

- Node.js 18+
- npm 9+
- Git

## 🛠️ Instalace a spuštění

```bash
# 1. Klonování repositáře
git clone https://github.com/petrsovadina/lekar-na-dohled.git
cd lekar-na-dohled

# 2. Instalace závislostí
npm install

# 3. Nastavení prostředí
cp .env.example .env.local
# Vyplňte potřebné API klíče

# 4. Spuštění vývojového serveru
npm run dev
```

Aplikace bude dostupná na `http://localhost:3000`

## 🏗️ Struktura projektu

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── chat/              # Chat stránka
│   ├── rezervace/         # Rezervace systém
│   └── vyhledavani/       # Vyhledávání lékařů
├── components/            # React komponenty
│   ├── auth/              # Autentifikace
│   ├── booking/           # Rezervace
│   ├── doctor-search/     # Vyhledávání
│   ├── gdpr/              # GDPR compliance
│   └── ui/                # UI komponenty (Shadcn)
├── database/              # SQL schémata a migrace
├── examples/              # Příklady implementace
├── lib/                   # Utility funkce
├── types/                 # TypeScript definice
└── tests/                 # Testy
```

## 🧪 Testování

```bash
# Unit testy
npm run test

# E2E testy
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🌍 České zdravotnictví - Specifika

### Podporované pojišťovny
- **VZP** (111) - Všeobecná zdravotní pojišťovna
- **VOZP** (201) - Vojenská zdravotní pojišťovna
- **ČPZP** (205) - Česká průmyslová zdravotní pojišťovna
- **OZP** (207) - Oborová zdravotní pojišťovna
- **ZPŠ** (209) - Zdravotní pojišťovna Škoda
- **ZPMV** (211) - Zdravotní pojišťovna ministerstva vnitra
- **RBP** (213) - Revírní bratrská pokladna

### Validace dat
- ✅ Rodná čísla (Czech birth numbers)
- ✅ IČO (Company identification)
- ✅ Telefonní čísla (+420 formát)
- ✅ PSČ (Czech postal codes)

## 🔐 GDPR & Bezpečnost

- **End-to-end šifrování** telemedicínských hovorů
- **Explicitní consent** pro zpracování zdravotních dat
- **Automatické mazání** dat po stanovené době
- **Anonymizované logování** bez osobních údajů
- **Audit trail** všech operací se zdravotními daty

## 🤖 AI Asistent - Etické zásady

⚠️ **DŮLEŽITÉ**: AI asistent nikdy:
- ❌ Nediagnostikuje nemoci
- ❌ Nepředepisuje léčbu
- ❌ Nenahrazuje lékařskou konzultaci

✅ **AI asistent pomáhá s**:
- 🎯 Směrováním k příslušné specializaci
- 📝 Přípravou na návštěvu lékaře
- 🔍 Vyhledáním vhodného poskytovatele
- 📚 Obecnými zdravotními informacemi

## 📚 Dokumentace

- [CLAUDE.md](./CLAUDE.md) - Pravidla pro AI asistenta
- [PLANNING.md](./PLANNING.md) - Architektura projektu
- [PRPs/](./PRPs/) - Product Requirements Prompts
- [examples/](./examples/) - Příklady implementace

## 🤝 Příspěvky

1. Fork projektu
2. Vytvořte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit změny (`git commit -m 'Add AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otevřete Pull Request

## 📄 Licence

Tento projekt je licencován pod MIT licencí - viz [LICENSE](LICENSE) soubor.

## 📞 Kontakt

- **Email**: info@doktor-na-dohled.cz
- **Web**: [doktor-na-dohled.cz](https://doktor-na-dohled.cz)
- **GitHub**: [github.com/petrsovadina/lekar-na-dohled](https://github.com/petrsovadina/lekar-na-dohled)

---

**🏥 Zlepšujeme dostupnost zdravotní péče v České republice pomocí AI technologií.**