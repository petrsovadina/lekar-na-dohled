# DoktorNaDohled - AI Healthcare Platform PRP

## Goal
Vytvoř kompletní AI konverzační platformu pro české zdravotnictví s inteligentním vyhledáváním lékařů, rezervačním systémem, telemedicínskými funkcemi a GDPR compliance. Platform bude umožňovat AI-řízený dialog pro identifikaci zdravotních potřeb, doporučování odpovídajících specialistů a usnadnění rezervace.

## Why
- **Zlepšení dostupnosti zdravotní péče**: Snížit čekací doby a zjednodušit přístup k lékařské péči v ČR
- **Personalizovaná péče**: AI poskytuje doporučení založená na specifických potřebách pacienta
- **Efektivita pro lékaře**: Automatizace administrativních úkolů a lepší plánování ordinace
- **Moderní zdravotnictví**: Integrace moderních technologií do českého zdravotního systému
- **GDPR compliance**: Bezpečné zpracování citlivých zdravotních dat podle evropských standardů

## What
Implementace kompletní Next.js 14 platformy s následujícími funkcemi:

### Uživatelsky viditelné chování:
1. **AI Konverzace**: Inteligentní chat bot pro zdravotní konzultace
2. **Vyhledávání lékařů**: Filtrování podle specializace, lokality, dostupnosti
3. **Rezervační systém**: Online objednávání s kalendářním rozhraním
4. **Telemedicína**: Základní videohovor funkcionalita
5. **Hodnocení**: Systém zpětné vazby pro lékaře
6. **Personalizace**: Doporučení založená na historii a preferencích

### Technické požadavky:
- Next.js 14 App Router s TypeScript strict mode
- Supabase PostgreSQL databáze s Row Level Security
- Vercel AI SDK pro konverzace
- GDPR compliance pro zdravotní data
- České lokalizace a zdravotní standardy

### Success Criteria
- [ ] AI chat poskytuje relevantní doporučení lékařů
- [ ] Vyhledávání najde lékaře podle českých specializací
- [ ] Rezervace funguje s kalendářní integrací
- [ ] GDPR consent flow je implementován
- [ ] Platform je plně lokalizován do češtiny
- [ ] Všechny testy procházejí bez chyb
- [ ] Performance: < 3s loading time pro hlavní stránky

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window

- url: https://ai-sdk.dev/docs/getting-started/nextjs-app-router
  why: Official Vercel AI SDK documentation for Next.js App Router integration
  
- url: https://supabase.com/docs/guides/auth
  why: Supabase authentication patterns for healthcare applications
  
- url: https://ui.shadcn.com/docs/components
  why: UI component library for consistent design system
  
- file: examples/ai-chat/HealthChat.tsx
  why: Existing AI chat implementation pattern to follow
  
- file: examples/data-models/doctor.py
  why: Czech healthcare data models with GDPR compliance
  
- file: examples/doctor-search/DoctorSearch.tsx
  why: Search component patterns and Czech specialization filters
  
- url: https://cms.law/en/int/expert-guides/cms-expert-guide-to-digital-health-apps-and-telemedicine/czech-republic
  why: Czech Republic specific digital health legal requirements
  
- url: https://techgdpr.com/industries/gdpr-compliance-for-health-tech-and-ehealth-companies/
  critical: GDPR implementation specifics for healthcare data processing
  
- url: https://github.com/vercel/ai-chatbot
  why: Production-ready AI chatbot template for reference
  
- docfile: CLAUDE.md
  why: Project-specific rules and Czech healthcare standards
  
- url: https://data.gov.cz/datová-sada?iri=https://data.gov.cz/zdroj/datové-sady/00024341/aa4c99d9f1480cca59807389cf88d4dc
  why: Official Czech healthcare provider registry for data integration
```

### Current Codebase Tree
```bash
lekar-na-dohled/
├── CLAUDE.md                  # Project rules and Czech healthcare standards
├── INITIAL.md                 # Feature requirements
├── README.md                  # Project documentation
├── PRPs/                      # Project Requirement Plans
│   └── templates/
│       └── prp_base.md
└── examples/                  # Implementation patterns
    ├── ai-chat/               # AI conversation components
    │   ├── HealthChat.tsx     # Main chat interface
    │   ├── MessageBubble.tsx  # Message display component
    │   └── api-route.ts       # OpenAI API integration
    ├── booking-system/        # Empty - needs implementation
    ├── data-models/           # Pydantic models
    │   ├── appointment.py     # Booking data structures
    │   ├── doctor.py          # Doctor profiles with Czech specializations
    │   └── patient.py         # Patient data with GDPR compliance
    ├── doctor-search/         # Search functionality
    │   ├── DoctorCard.tsx     # Doctor display component
    │   └── DoctorSearch.tsx   # Search interface
    ├── nextjs-setup/          # Project configuration
    │   └── package.json       # Dependencies and scripts
    └── supabase-integration/  # Database services
        └── doctor-service.ts  # Database operations
```

### Desired Codebase Tree with Files to be Added
```bash
lekar-na-dohled/
├── app/                       # Next.js 14 App Router
│   ├── layout.tsx            # Root layout with Czech localization
│   ├── page.tsx              # Landing page with AI chat
│   ├── vyhledavani/          # Doctor search pages
│   │   ├── page.tsx          # Search interface
│   │   └── [id]/             # Doctor detail pages
│   ├── rezervace/            # Booking system
│   │   ├── page.tsx          # Booking form
│   │   └── potvrzeni/        # Confirmation pages
│   ├── api/                  # API routes
│   │   ├── chat/             # AI chat endpoints
│   │   ├── doctors/          # Doctor data endpoints
│   │   ├── appointments/     # Booking endpoints
│   │   └── auth/             # Authentication
│   └── telemedicina/         # Video call features
├── components/               # Reusable UI components
│   ├── ui/                   # Shadcn components
│   ├── ChatInterface.tsx     # AI conversation UI
│   ├── DoctorList.tsx        # Doctor listing with filters
│   ├── BookingCalendar.tsx   # Appointment scheduling
│   ├── VideoCall.tsx         # Telemedicine component
│   └── GDPRConsent.tsx       # Privacy consent forms
├── lib/                      # Utility functions
│   ├── supabase.ts          # Database client
│   ├── ai-config.ts         # AI SDK configuration
│   ├── czech-validation.ts  # Czech-specific validators
│   └── gdpr-utils.ts        # GDPR compliance helpers
├── types/                    # TypeScript definitions
│   ├── doctor.ts            # Doctor interface types
│   ├── patient.ts           # Patient data types
│   └── appointment.ts       # Booking types
├── hooks/                    # Custom React hooks
│   ├── useChat.ts           # AI conversation state
│   ├── useDoctorSearch.ts   # Search functionality
│   └── useBooking.ts        # Appointment booking
├── styles/                   # Styling
│   └── globals.css          # Tailwind and custom styles
├── database/                 # Database schema and migrations
│   ├── schema.sql           # Supabase table definitions
│   └── migrations/          # Database version control
├── tests/                    # Test suites
│   ├── components/          # Component unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                # End-to-end tests
├── docs/                     # Project documentation
└── public/                   # Static assets
```

### Known Gotchas of our Codebase & Library Quirks
```typescript
// CRITICAL: Vercel AI SDK requires specific Next.js 14 App Router patterns
// Example: API routes must use route.ts convention, not api/[endpoint].js
// Example: AI streaming requires proper ReadableStream handling

// CRITICAL: Supabase RLS policies are mandatory for GDPR compliance
// Example: Patient data MUST be filtered by user auth on database level
// Example: Doctor profiles need public/private field separation

// CRITICAL: Czech healthcare specific validations
// IČO numbers: Must be exactly 8 digits with checksum validation
// Rodná čísla: Must follow YYMMDD/XXXX format with proper validation
// Phone numbers: Must support +420 Czech format

// CRITICAL: GDPR data processing consent
// Health data requires explicit consent before any processing
// Consent must be granular (chat, booking, telemedicine separately)
// Data retention periods must be configurable and enforced

// CRITICAL: AI safety for healthcare
// Never provide medical diagnosis or treatment recommendations
// Always include disclaimers about professional medical consultation
// Implement content filtering for inappropriate medical advice

// LIBRARY QUIRKS:
// - Vercel AI SDK useChat hook requires 'use client' directive
// - Supabase client must be instantiated per request in API routes
// - Next.js 14 metadata API is required for SEO optimization
// - Tailwind CSS requires explicit Czech diacritics font support
```

## Implementation Blueprint

### Data Models and Structure

Create the core data models ensuring type safety, Czech healthcare compliance, and GDPR requirements:

```typescript
// Core data structures with Czech healthcare standards
interface Doctor {
  ico: string;                    // 8-digit IČO with validation
  clk_license: string;            // ČLK licence number
  specializations: CzechSpecialization[];
  languages: Language[];
  telemedicine_enabled: boolean;
  gdpr_consent_date: Date;
}

interface Patient {
  birth_number?: string;          // Optional rodné číslo
  insurance_company: CzechInsurance;
  gdpr_consents: {
    chat: boolean;
    booking: boolean;
    telemedicine: boolean;
    date: Date;
  };
}

interface Appointment {
  type: 'in_person' | 'telemedicine';
  czech_region: CzechRegion;
  insurance_covered: boolean;
}
```

### List of Tasks to be Completed (in Order)

```yaml
Task 1 - Project Setup:
CREATE next.config.js:
  - CONFIGURE for Czech locale support
  - ENABLE experimental features for AI SDK
  - SET UP environment variables

CREATE app/layout.tsx:
  - IMPLEMENT root layout with Czech localization
  - INCLUDE GDPR consent banner
  - SET UP Supabase auth provider

Task 2 - Database Schema:
CREATE database/schema.sql:
  - MIRROR pattern from: examples/data-models/
  - IMPLEMENT Czech healthcare tables (doctors, patients, appointments)
  - ADD RLS policies for GDPR compliance
  - CREATE indexes for performance

Task 3 - Authentication System:
CREATE app/api/auth/[...nextauth]/route.ts:
  - IMPLEMENT Supabase Auth integration
  - ADD Czech identity verification
  - ENSURE GDPR consent tracking

Task 4 - AI Chat Interface:
MODIFY examples/ai-chat/HealthChat.tsx:
  - ENHANCE with Czech medical terminology
  - ADD doctor recommendation extraction
  - IMPLEMENT safety disclaimers

CREATE app/api/chat/route.ts:
  - INTEGRATE Vercel AI SDK with OpenAI/Groq
  - ADD Czech language processing
  - IMPLEMENT medical safety filters

Task 5 - Doctor Search System:
ENHANCE examples/doctor-search/DoctorSearch.tsx:
  - ADD Czech specialization filters
  - IMPLEMENT location-based search
  - INTEGRATE with AI recommendations

CREATE app/vyhledavani/page.tsx:
  - BUILD search interface
  - ADD map integration for Czech regions
  - IMPLEMENT advanced filtering

Task 6 - Booking System:
CREATE components/BookingCalendar.tsx:
  - IMPLEMENT calendar interface
  - ADD Czech holiday support
  - INTEGRATE with doctor availability

CREATE app/rezervace/page.tsx:
  - BUILD booking flow
  - ADD insurance verification
  - IMPLEMENT confirmation system

Task 7 - Telemedicine Features:
CREATE components/VideoCall.tsx:
  - IMPLEMENT WebRTC video calling
  - ADD Czech language interface
  - ENSURE end-to-end encryption

Task 8 - GDPR Compliance:
CREATE components/GDPRConsent.tsx:
  - IMPLEMENT granular consent forms
  - ADD data export functionality
  - CREATE privacy dashboard

CREATE lib/gdpr-utils.ts:
  - ADD data anonymization functions
  - IMPLEMENT retention policies
  - CREATE audit logging

Task 9 - Testing Suite:
CREATE tests/integration/booking-flow.test.ts:
  - TEST complete booking workflow
  - VERIFY GDPR compliance
  - CHECK Czech locale handling

CREATE tests/e2e/ai-chat.spec.ts:
  - TEST AI conversation flows
  - VERIFY doctor recommendations
  - CHECK safety measures

Task 10 - Deployment:
CREATE vercel.json:
  - CONFIGURE for Czech hosting requirements
  - SET UP environment variables
  - ENABLE analytics and monitoring
```

### Per Task Pseudocode

```typescript
// Task 4 - AI Chat Implementation
async function handleChatMessage(message: string, context: ChatContext): Promise<AIResponse> {
    // PATTERN: Always validate Czech medical terminology (see lib/czech-validation.ts)
    const validated = await validateMedicalQuery(message);
    
    // GOTCHA: Must include safety disclaimers for health content
    const systemPrompt = `
        Jste asistent pro vyhledávání lékařů v České republice.
        NIKDY nediagnostikujte ani nepředepisujte léčbu.
        Vždy doporučte konzultaci s kvalifikovaným lékařem.
        Odpovídejte pouze v češtině.
    `;
    
    // PATTERN: Use streaming for better UX (see examples/ai-chat/api-route.ts)
    const stream = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: validated.query }
        ],
        stream: true,
        functions: [extractDoctorRecommendations] // Custom function calling
    });
    
    // CRITICAL: Log interactions for GDPR audit trail
    await logChatInteraction(context.userId, message, response);
    
    return formatCzechResponse(stream);
}

// Task 6 - Booking System Implementation  
async function createAppointment(appointmentData: AppointmentRequest): Promise<BookingResult> {
    // PATTERN: Validate Czech healthcare requirements first
    const validation = await validateCzechBooking(appointmentData);
    if (!validation.valid) throw new ValidationError(validation.errors);
    
    // GOTCHA: Check insurance coverage for specific procedures
    const insuranceCoverage = await checkInsuranceCoverage(
        appointmentData.patientInsurance,
        appointmentData.procedureCode
    );
    
    // PATTERN: Use Supabase RLS for data security
    const { data, error } = await supabase
        .from('appointments')
        .insert({
            ...appointmentData,
            insurance_covered: insuranceCoverage.covered,
            created_by: context.user.id
        })
        .select();
    
    // CRITICAL: Send confirmation in Czech with proper formatting
    await sendCzechConfirmation(data.id, appointmentData.patientEmail);
    
    return formatBookingResponse(data);
}
```

### Integration Points
```yaml
DATABASE:
  - migration: "Create Czech healthcare tables with RLS policies"
  - indexes: "CREATE INDEX idx_doctor_specialization ON doctors(specialization_code)"
  - triggers: "Automatic GDPR consent expiration cleanup"
  
CONFIG:
  - add to: app/config/settings.ts
  - pattern: "CZECH_REGIONS = ['Praha', 'Brno', 'Ostrava', ...]"
  - environment: "OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY"
  
ROUTES:
  - add to: app/api/
  - pattern: "RESTful endpoints with proper error handling"
  - middleware: "Authentication and GDPR consent validation"
  
EXTERNAL_APIS:
  - integration: "Czech healthcare provider registry"
  - pattern: "Automated data synchronization with error recovery"
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm run lint                    # ESLint with Next.js rules
npm run type-check             # TypeScript validation
npm run build                  # Next.js production build test

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests
```typescript
// CREATE tests for each component with Czech healthcare scenarios
describe('AI Chat Component', () => {
  test('provides Czech medical recommendations', async () => {
    const response = await handleHealthQuery('bolí mě hlava');
    expect(response.language).toBe('cs');
    expect(response.recommendations).toContainEqual(
      expect.objectContaining({
        specialization: 'neurolog',
        reason: expect.stringContaining('bolest hlavy')
      })
    );
  });

  test('refuses to provide diagnosis', async () => {
    const response = await handleHealthQuery('Mám rakovinu?');
    expect(response.disclaimer).toContain('nejsem lékař');
    expect(response.action).toBe('seek_professional_help');
  });
});

describe('Doctor Search', () => {
  test('finds Czech specialists by region', async () => {
    const doctors = await searchDoctors({
      specialization: 'kardiolog',
      region: 'Praha',
      insurance: 'VZP'
    });
    
    expect(doctors).toHaveLength(greaterThan(0));
    expect(doctors[0]).toHaveProperty('ico');
    expect(doctors[0].ico).toMatch(/^\d{8}$/);
  });
});

describe('GDPR Compliance', () => {
  test('requires explicit consent for health data', async () => {
    const patient = await createPatient(patientData);
    expect(patient.gdpr_consents.chat).toBe(false);
    
    await expect(
      storeHealthData(patient.id, healthData)
    ).rejects.toThrow('GDPR consent required');
  });
});
```

```bash
# Run and iterate until passing:
npm run test                    # Jest unit tests
npm run test:e2e               # Playwright end-to-end tests
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test
```bash
# Start the development server
npm run dev

# Test the AI chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{"message": "Hledám kardiologa v Praze", "userId": "test-user"}'

# Expected: {"recommendations": [...], "language": "cs", "disclaimer": "..."}

# Test doctor search
curl -X GET "http://localhost:3000/api/doctors?specialization=kardiolog&region=Praha" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"

# Expected: Array of Czech doctors with proper formatting

# Test booking system
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{"doctorId": "123", "datetime": "2024-07-15T10:00:00Z", "type": "in_person"}'

# Expected: {"appointmentId": "...", "confirmation": "...", "czech_confirmation": true}
```

## Final Validation Checklist
- [ ] All tests pass: `npm run test && npm run test:e2e`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Production build successful: `npm run build`
- [ ] AI chat responds in Czech with proper disclaimers
- [ ] Doctor search finds Czech specialists correctly
- [ ] Booking system handles Czech dates/times properly
- [ ] GDPR consent flow is implemented and functional
- [ ] Czech localization is complete (UI, error messages, emails)
- [ ] Performance: All pages load under 3 seconds
- [ ] Accessibility: WCAG 2.1 compliance verified
- [ ] Security: No health data leaks in logs or client-side
- [ ] Manual booking flow test successful with Czech doctor

---

## Anti-Patterns to Avoid
- ❌ Don't store health data without explicit GDPR consent
- ❌ Don't provide medical diagnosis or treatment advice through AI
- ❌ Don't hardcode Czech text - use proper i18n system
- ❌ Don't skip insurance verification for booking
- ❌ Don't log sensitive health information
- ❌ Don't use sync functions in AI streaming context
- ❌ Don't ignore Czech healthcare regulatory requirements
- ❌ Don't bypass Supabase RLS policies for any reason
- ❌ Don't cache user health data without time limits
- ❌ Don't allow unauthenticated access to any health endpoints

**PRP Confidence Score: 9/10**
*Vysoká úroveň kontextu, specifické Czech healthcare requirements, kompletní validation gates, a detailní implementační plán pro one-pass úspěch.*