# Examples pro DoktorNaDohled

Tato složka obsahuje příklady kódu a vzory implementace pro projekt DoktorNaDohled. Každý příklad demonstruje specifický aspekt aplikace.

## 📁 Struktura příkladů:

### `nextjs-setup/`
**Účel**: Základní konfigurace Next.js projektu s Tailwind CSS a Shadcn/UI
**Obsahuje**: 
- `package.json` - Dependencies a skripty
- `tailwind.config.js` - Konfigurace Tailwind CSS
- `components.json` - Konfigurace Shadcn/UI
- Layout komponenty a základní setup

### `ai-chat/` 
**Účel**: Implementace AI chatovacího rozhraní pro zdravotnické konzultace
**Obsahuje**:
- Chat komponenta s Vercel AI SDK
- Streamování AI odpovědí
- Handling zdravotnických dotazů
- Message komponenty s typing indicatorem

### `supabase-integration/`
**Účel**: Integrace s Supabase databází a autentifikací
**Obsahuje**:
- Supabase client setup
- Database schema pro lékaře, pacienty, schůzky
- Auth hooks a komponenty
- CRUD operace

### `doctor-search/`
**Účel**: Komponenta pro vyhledávání a filtrování lékařů
**Obsahuje**:
- Search komponenta s filtry
- Doctor card komponenta
- Geolokační vyhledávání
- Sorting a pagination

### `booking-system/`
**Účel**: Rezervační systém pro schůzky s lékaři
**Obsahuje**:
- Kalendářová komponenta
- Time slot picker
- Booking form s validací
- Potvrzovací systém

### `data-models/`
**Účel**: Pydantic modely pro validaci dat a TypeScript typy
**Obsahuje**:
- Doctor model
- Patient model
- Appointment model
- API response schemas

## 🎯 Jak používat příklady:

1. **Pro inspiraci**: Prostudujte kód a pochopte vzory
2. **Pro kopírování**: Upravte kód podle vašich potřeb
3. **Pro referenci**: Použijte jako základ pro implementaci
4. **Pro testování**: Spusťte příklady lokálně

## 📖 Důležité poznámky:

- Všechny příklady jsou navrženy pro **české zdravotnictví**
- Dodržují **GDPR** standardy pro zdravotní data
- Používají **českou lokalizaci**
- Obsahují **error handling** a **loading states**
- Jsou **přístupné** (accessibility-friendly)

## 🚀 Quick Start:

```bash
# Nainstalujte dependencies
npm install

# Spusťte development server
npm run dev

# Spusťte příklad
cd examples/ai-chat
npm run dev
```
