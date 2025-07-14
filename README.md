# Šablona pro Context Engineering

Komplexní šablona pro začátek s Context Engineering – disciplínou navrhování kontextu pro AI asistenty při programování, aby měli všechny potřebné informace pro kompletní splnění úkolu.

> **Context Engineering je 10x lepší než prompt engineering a 100x lepší než „vibe coding“.**

## 🚀 Rychlý start

```bash
# 1. Naklonujte tuto šablonu
git clone https://github.com/coleam00/Context-Engineering-Intro.git
cd Context-Engineering-Intro

# 2. Nastavte pravidla projektu (volitelné – šablona je součástí)
# Upravte CLAUDE.md a přidejte specifické pokyny pro váš projekt

# 3. Přidejte příklady (velmi doporučeno)
# Umístěte relevantní ukázky kódu do složky examples/

# 4. Vytvořte počáteční požadavek na funkci
# Upravte INITIAL.md s požadavky na funkci

# 5. Vygenerujte komplexní PRP (Product Requirements Prompt)
# V Claude Code spusťte:
/generate-prp INITIAL.md

# 6. Proveďte PRP pro implementaci funkce
# V Claude Code spusťte:
/execute-prp PRPs/your-feature-name.md
```

## 📚 Obsah

- [Co je Context Engineering?](#co-je-context-engineering)
- [Struktura šablony](#struktura-šablony)
- [Krok za krokem](#krok-za-krokem)
- [Jak psát efektivní INITIAL.md](#jak-psat-efektivni-initialmd)
- [PRP workflow](#prp-workflow)
- [Efektivní využití příkladů](#efektivni-vyuziti-prikladu)
- [Osvědčené postupy](#osvedcene-postupy)

## Co je Context Engineering?

Context Engineering představuje posun oproti tradičnímu prompt engineeringu:

### Prompt Engineering vs Context Engineering

**Prompt Engineering:**
- Zaměřuje se na chytré formulace a konkrétní zadání
- Omezeno na to, jak úkol popíšete
- Jako když někomu dáte lísteček s poznámkou

**Context Engineering:**
- Kompletní systém pro poskytování kontextu
- Zahrnuje dokumentaci, příklady, pravidla, vzory a validaci
- Jako když napíšete celý scénář se všemi detaily

### Proč je Context Engineering důležitý

1. **Snižuje selhání AI**: Většina selhání není způsobena modelem, ale nedostatkem kontextu
2. **Zajišťuje konzistenci**: AI dodržuje vzory a konvence projektu
3. **Umožňuje komplexní funkce**: AI zvládne vícekrokové implementace díky správnému kontextu
4. **Samoopravné**: Validační smyčky umožňují AI opravovat vlastní chyby

## Struktura šablony

```
context-engineering-intro/
├── .claude/
│   ├── commands/
│   │   ├── generate-prp.md    # Generuje komplexní PRP
│   │   └── execute-prp.md     # Implementuje funkce dle PRP
│   └── settings.local.json    # Oprávnění pro Claude Code
├── PRPs/
│   ├── templates/
│   │   └── prp_base.md       # Základní šablona PRP
│   └── EXAMPLE_multi_agent_prp.md  # Ukázka kompletního PRP
├── examples/                  # Vaše ukázky kódu (klíčové!)
├── CLAUDE.md                 # Globální pravidla pro AI asistenta
├── INITIAL.md               # Šablona pro požadavky na funkce
├── INITIAL_EXAMPLE.md       # Ukázkový požadavek na funkci
└── README.md                # Tento soubor
```

Tato šablona se zatím nezaměřuje na RAG a nástroje v rámci context engineeringu – brzy toho bude mnohem víc. ;)

## Krok za krokem

### 1. Nastavte globální pravidla (CLAUDE.md)

Soubor `CLAUDE.md` obsahuje pravidla platná pro celý projekt, která AI asistent dodržuje v každé konverzaci. Šablona obsahuje:

- **Povědomí o projektu**: Čtení plánovacích dokumentů, kontrola úkolů
- **Struktura kódu**: Limity velikosti souborů, organizace modulů
- **Požadavky na testování**: Vzory unit testů, očekávání pokrytí
- **Konvence stylu**: Preferované jazyky, pravidla formátování
- **Standardy dokumentace**: Formáty docstringů, komentování

**Můžete použít šablonu tak, jak je, nebo ji upravit pro svůj projekt.**

### 2. Vytvořte počáteční požadavek na funkci

Upravte `INITIAL.md` a popište, co chcete vytvořit:

```markdown
## FEATURE:
[Popište, co chcete vytvořit – buďte konkrétní ohledně funkcionality a požadavků]

## EXAMPLES:
[Vyjmenujte soubory ve složce examples/ a vysvětlete, jak je použít]

## DOCUMENTATION:
[Přidejte odkazy na relevantní dokumentaci, API nebo MCP server]

## OTHER CONSIDERATIONS:
[Zmiňte úskalí, specifické požadavky nebo věci, které AI často přehlíží]
```

**Kompletní příklad najdete v `INITIAL_EXAMPLE.md`.**

### 3. Vygenerujte PRP

PRP (Product Requirements Prompt) je komplexní plán implementace obsahující:

- Kompletní kontext a dokumentaci
- Kroky implementace s validací
- Vzory pro ošetření chyb
- Požadavky na testování

Jsou podobné PRD (Product Requirements Document), ale jsou určeny přímo pro AI asistenta.

V Claude Code spusťte:
```bash
/generate-prp INITIAL.md
```

**Poznámka:** Slash příkazy jsou definovány v `.claude/commands/`. Jejich implementaci najdete zde:
- `.claude/commands/generate-prp.md` – Jak vyhledává a vytváří PRP
- `.claude/commands/execute-prp.md` – Jak implementuje funkce z PRP

Proměnná `$ARGUMENTS` přijímá vše, co zadáte za název příkazu (např. `INITIAL.md` nebo `PRPs/your-feature.md`).

Tento příkaz:
1. Přečte váš požadavek na funkci
2. Prozkoumá kód pro vzory
3. Najde relevantní dokumentaci
4. Vytvoří komplexní PRP v `PRPs/your-feature-name.md`

### 4. Proveďte PRP

Po vygenerování spusťte PRP pro implementaci funkce:

```bash
/execute-prp PRPs/your-feature-name.md
```

AI asistent:
1. Načte celý kontext z PRP
2. Vytvoří detailní plán implementace
3. Provede každý krok s validací
4. Spustí testy a opraví chyby
5. Ověří splnění všech kritérií

## Jak psát efektivní INITIAL.md

### Klíčové sekce

**FEATURE**: Buďte konkrétní a důkladní
- ❌ "Vytvoř web scraper"
- ✅ "Vytvoř asynchronní web scraper pomocí BeautifulSoup, který získává produktová data z e-shopů, řeší rate limiting a ukládá výsledky do PostgreSQL"

**EXAMPLES**: Využijte složku examples/
- Umístěte relevantní vzory kódu do `examples/`
- Odkazujte na konkrétní soubory a vzory
- Vysvětlete, co má být převzato

**DOCUMENTATION**: Přidejte všechny relevantní zdroje
- Odkazy na API dokumentaci
- Návody ke knihovnám
- Dokumentaci MCP serveru
- Schémata databáze

**OTHER CONSIDERATIONS**: Zachyťte důležité detaily
- Požadavky na autentizaci
- Limity nebo kvóty
- Běžné chyby
- Výkonnostní požadavky

## PRP workflow

### Jak funguje /generate-prp

Příkaz postupuje takto:

1. **Fáze průzkumu**
   - Analyzuje kód pro vzory
   - Hledá podobné implementace
   - Identifikuje konvence

2. **Shromažďování dokumentace**
   - Získává relevantní API dokumentaci
   - Přidává dokumentaci knihoven
   - Zahrnuje úskalí a zvláštnosti

3. **Vytvoření plánu**
   - Vytváří krok za krokem plán implementace
   - Přidává validační brány
   - Zahrnuje požadavky na testy

4. **Kontrola kvality**
   - Uděluje skóre jistoty (1–10)
   - Ověřuje kompletnost kontextu

### Jak funguje /execute-prp

1. **Načtení kontextu**: Přečte celý PRP
2. **Plánování**: Vytvoří detailní seznam úkolů pomocí TodoWrite
3. **Implementace**: Provede jednotlivé komponenty
4. **Validace**: Spustí testy a lint
5. **Iterace**: Opraví nalezené chyby
6. **Dokončení**: Ověří splnění všech požadavků

Kompletní ukázku najdete v `PRPs/EXAMPLE_multi_agent_prp.md`.

## Efektivní využití příkladů

Složka `examples/` je **klíčová** pro úspěch. AI asistenti dosahují lepších výsledků, když mají vzory, které mohou následovat.

### Co zahrnout do příkladů

1. **Vzory struktury kódu**
   - Organizace modulů
   - Konvence importů
   - Vzory tříd/funkcí

2. **Vzory testování**
   - Struktura testovacích souborů
   - Přístupy k mockování
   - Styl asercí

3. **Vzory integrace**
   - Implementace API klientů
   - Připojení k databázi
   - Autentizační toky

4. **Vzory CLI**
   - Parsování argumentů
   - Formátování výstupu
   - Ošetření chyb

### Ukázková struktura

```
examples/
├── README.md           # Vysvětluje, co jednotlivé příklady ukazují
├── cli.py             # Vzor implementace CLI
├── agent/             # Vzory architektury agentů
│   ├── agent.py      # Vzor vytvoření agenta
│   ├── tools.py      # Vzor implementace nástrojů
│   └── providers.py  # Vzor pro více poskytovatelů
└── tests/            # Vzory testování
    ├── test_agent.py # Vzory unit testů
    └── conftest.py   # Konfigurace pro pytest
```

## Osvědčené postupy

### 1. Buďte explicitní v INITIAL.md
- Nepředpokládejte, že AI zná vaše preference
- Uveďte konkrétní požadavky a omezení
- Odkazujte na příklady

### 2. Poskytněte komplexní příklady
- Více příkladů = lepší implementace
- Ukažte, co dělat i co nedělat
- Zahrňte vzory ošetření chyb

### 3. Používejte validační brány
- PRP obsahují testovací příkazy, které musí projít
- AI iteruje, dokud všechny validace neprojdou
- Zajišťuje funkční kód na první pokus

### 4. Využívejte dokumentaci
- Přidejte oficiální API dokumentaci
- Přidejte zdroje MCP serveru
- Odkazujte na konkrétní sekce dokumentace

### 5. Upravte CLAUDE.md
- Přidejte své konvence
- Zahrňte pravidla specifická pro projekt
- Definujte standardy kódování

## Zdroje

- [Claude Code Dokumentace](https://docs.anthropic.com/en/docs/claude-code)
- [Osvědčené postupy Context Engineeringu](https://www.philschmid.de/context-engineering)