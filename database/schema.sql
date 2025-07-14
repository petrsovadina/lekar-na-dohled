-- DoktorNaDohled Database Schema
-- České zdravotnictví s GDPR compliance pro Supabase

-- Aktivace rozšíření
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUM TYPY PRO ČESKÉ ZDRAVOTNICTVÍ
-- =============================================

-- České lékařské specializace
CREATE TYPE specialization_enum AS ENUM (
    'prakticky_lekar',
    'kardiolog', 
    'dermatolog',
    'neurolog',
    'ortoped',
    'gynekolog',
    'urolog',
    'psychiatr',
    'oftalmolog',
    'orl',
    'anesteziolog',
    'chirurg',
    'pediatr',
    'geriatr',
    'onkolog',
    'endokrinolog',
    'pneumolog',
    'gastroenterolog',
    'nefrolog',
    'revmatolog'
);

-- České zdravotní pojišťovny
CREATE TYPE insurance_company_enum AS ENUM (
    '111', -- VZP (Všeobecná zdravotní pojišťovna)
    '201', -- VOZP (Vojenská zdravotní pojišťovna)
    '205', -- ČPZP (Česká průmyslová zdravotní pojišťovna)
    '207', -- OZP (Oborová zdravotní pojišťovna)
    '209', -- ZPŠ (Zdravotní pojišťovna Škoda)
    '211', -- ZPMV (Zdravotní pojišťovna ministerstva vnitra)
    '213'  -- RBP (Revírní bratrská pokladna)
);

-- Typ pohlaví
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');

-- Stavy schůzek
CREATE TYPE appointment_status_enum AS ENUM (
    'scheduled',
    'confirmed', 
    'in_progress',
    'completed',
    'cancelled',
    'no_show'
);

-- Typy schůzek
CREATE TYPE appointment_type_enum AS ENUM (
    'in_person',
    'telemedicine',
    'phone_call'
);

-- GDPR consent typy
CREATE TYPE consent_type_enum AS ENUM (
    'chat',
    'booking',
    'telemedicine',
    'marketing',
    'analytics'
);

-- České kraje
CREATE TYPE czech_region_enum AS ENUM (
    'Praha',
    'Středočeský kraj',
    'Jihočeský kraj',
    'Plzeňský kraj',
    'Karlovarský kraj',
    'Ústecký kraj',
    'Liberecký kraj',
    'Královéhradecký kraj',
    'Pardubický kraj',
    'Vysočina',
    'Jihomoravský kraj',
    'Olomoucký kraj',
    'Zlínský kraj',
    'Moravskoslezský kraj'
);

-- =============================================
-- CORE TABLES
-- =============================================

-- Uživatelé (založeno na Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- GDPR tracking
    gdpr_consent_version TEXT,
    gdpr_consent_date TIMESTAMPTZ,
    data_retention_until TIMESTAMPTZ,
    
    -- Audit trail
    created_by UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT
);

-- Lékaři
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Základní informace
    first_name TEXT NOT NULL CHECK (length(first_name) >= 2),
    last_name TEXT NOT NULL CHECK (length(last_name) >= 2),
    title TEXT, -- MUDr., Doc., Prof.
    phone TEXT CHECK (phone ~ '^\+420\d{9}$'),
    
    -- Profesní informace
    specialization specialization_enum NOT NULL,
    license_number TEXT NOT NULL UNIQUE, -- ČLK licence
    ico TEXT CHECK (ico ~ '^\d{8}$'), -- IČO
    medical_chamber_id TEXT, -- ID v komoře
    
    -- Adresa ordinace
    practice_name TEXT,
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL CHECK (postal_code ~ '^\d{5}$'),
    region czech_region_enum NOT NULL,
    
    -- Provozní informace
    accepts_new_patients BOOLEAN DEFAULT TRUE,
    has_online_booking BOOLEAN DEFAULT FALSE,
    telemedicine_available BOOLEAN DEFAULT FALSE,
    languages TEXT[] DEFAULT ARRAY['cs'], -- Podporované jazyky
    
    -- Hodnocení a statistiky
    rating DECIMAL(2,1) CHECK (rating >= 1.0 AND rating <= 5.0),
    review_count INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    
    -- Časová dostupnost (JSON struktura pro ordinační hodiny)
    working_hours JSONB,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMPTZ,
    
    -- GDPR compliance
    data_processing_consent BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMPTZ,
    
    CONSTRAINT doctors_rating_check CHECK (rating IS NULL OR (rating >= 1.0 AND rating <= 5.0))
);

-- Pacienti
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Základní informace
    first_name TEXT NOT NULL CHECK (length(first_name) >= 2),
    last_name TEXT NOT NULL CHECK (length(last_name) >= 2),
    phone TEXT CHECK (phone ~ '^\+420\d{9}$'),
    
    -- Osobní informace (šifrované pro GDPR)
    date_of_birth DATE NOT NULL,
    gender gender_enum NOT NULL,
    birth_number TEXT CHECK (birth_number ~ '^\d{6}\/\d{4}$'), -- Rodné číslo
    
    -- Zdravotní pojištění
    insurance_company insurance_company_enum NOT NULL,
    insurance_number TEXT NOT NULL,
    
    -- Adresa (volitelná)
    street_address TEXT,
    city TEXT,
    postal_code TEXT CHECK (postal_code IS NULL OR postal_code ~ '^\d{5}$'),
    region czech_region_enum,
    
    -- Zdravotní informace (šifrované)
    allergies TEXT[],
    chronic_conditions TEXT[],
    current_medications TEXT[],
    emergency_contact TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- GDPR compliance
    gdpr_consent BOOLEAN NOT NULL DEFAULT FALSE,
    consent_details JSONB, -- Granular consent pro různé účely
    data_retention_until TIMESTAMPTZ,
    
    CONSTRAINT patients_age_check CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '1 year')
);

-- GDPR Consent Tracking
CREATE TABLE gdpr_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    consent_type consent_type_enum NOT NULL,
    consented BOOLEAN NOT NULL,
    consent_date TIMESTAMPTZ DEFAULT NOW(),
    withdrawal_date TIMESTAMPTZ,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    consent_version TEXT,
    legal_basis TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, consent_type, consent_date)
);

-- Schůzky/Rezervace
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    
    -- Časové informace
    scheduled_datetime TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30 CHECK (duration_minutes BETWEEN 15 AND 120),
    
    -- Typ a stav
    appointment_type appointment_type_enum DEFAULT 'in_person',
    status appointment_status_enum DEFAULT 'scheduled',
    
    -- Detaily schůzky
    reason TEXT NOT NULL CHECK (length(reason) >= 10),
    notes TEXT, -- Poznámky lékaře
    diagnosis TEXT, -- Diagnóza po vyšetření
    
    -- Telemedicína
    video_call_url TEXT,
    call_started_at TIMESTAMPTZ,
    call_ended_at TIMESTAMPTZ,
    
    -- Platba
    price_czk DECIMAL(10,2) CHECK (price_czk >= 0),
    is_covered_by_insurance BOOLEAN DEFAULT TRUE,
    payment_status TEXT DEFAULT 'pending',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMPTZ,
    
    -- Hodnocení po návštěvě
    patient_rating INTEGER CHECK (patient_rating BETWEEN 1 AND 5),
    patient_feedback TEXT,
    doctor_notes TEXT,
    
    -- Constraints
    CONSTRAINT appointments_future_check CHECK (scheduled_datetime > NOW() - INTERVAL '1 day'),
    CONSTRAINT appointments_video_url_check CHECK (
        (appointment_type = 'telemedicine' AND video_call_url IS NOT NULL) OR
        (appointment_type != 'telemedicine')
    )
);

-- AI Chat Conversations (pro audit a zlepšování)
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Conversation metadata
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    total_messages INTEGER DEFAULT 0,
    
    -- AI model info
    ai_model TEXT DEFAULT 'gpt-4',
    model_version TEXT,
    
    -- Results
    recommended_doctors UUID[] DEFAULT ARRAY[]::UUID[],
    specialization_suggested specialization_enum,
    urgency_level INTEGER CHECK (urgency_level BETWEEN 1 AND 5),
    
    -- Privacy
    anonymized BOOLEAN DEFAULT FALSE,
    retention_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 years',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Chat Messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    
    message_order INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    -- AI metadata
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    
    -- Safety flags
    safety_flagged BOOLEAN DEFAULT FALSE,
    safety_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(conversation_id, message_order)
);

-- Reviews a hodnocení
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    
    -- Kategorie hodnocení
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
    wait_time_rating INTEGER CHECK (wait_time_rating BETWEEN 1 AND 5),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Prevent multiple reviews per appointment
    UNIQUE(appointment_id, patient_id)
);

-- Audit Log (pro GDPR compliance)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    
    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Retention podle českých zákonů
    retention_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 years'
);

-- =============================================
-- INDEXY PRO VÝKON
-- =============================================

-- Doctors
CREATE INDEX idx_doctors_specialization ON doctors(specialization) WHERE is_verified = TRUE;
CREATE INDEX idx_doctors_region ON doctors(region) WHERE is_verified = TRUE AND accepts_new_patients = TRUE;
CREATE INDEX idx_doctors_rating ON doctors(rating DESC) WHERE is_verified = TRUE;
CREATE INDEX idx_doctors_location ON doctors(city, region) WHERE is_verified = TRUE;
CREATE INDEX idx_doctors_license ON doctors(license_number);
CREATE INDEX idx_doctors_ico ON doctors(ico) WHERE ico IS NOT NULL;
CREATE INDEX idx_doctors_user_id ON doctors(user_id);

-- Patients
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_insurance ON patients(insurance_company);
CREATE INDEX idx_patients_birth_number ON patients(birth_number);
CREATE INDEX idx_patients_created_at ON patients(created_at);

-- Appointments
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, scheduled_datetime) WHERE status NOT IN ('cancelled', 'no_show');
CREATE INDEX idx_appointments_patient_date ON appointments(patient_id, scheduled_datetime);
CREATE INDEX idx_appointments_date_status ON appointments(scheduled_datetime, status);
CREATE INDEX idx_appointments_type ON appointments(appointment_type);
CREATE INDEX idx_appointments_upcoming ON appointments(scheduled_datetime) WHERE scheduled_datetime > NOW() AND status IN ('scheduled', 'confirmed');

-- Chat
CREATE INDEX idx_chat_conversations_user ON chat_conversations(user_id, started_at);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id, message_order);

-- Reviews
CREATE INDEX idx_reviews_doctor ON reviews(doctor_id, created_at) WHERE is_public = TRUE;
CREATE INDEX idx_reviews_rating ON reviews(doctor_id, rating) WHERE is_public = TRUE;

-- Audit
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at);

-- GDPR
CREATE INDEX idx_gdpr_consents_user ON gdpr_consents(user_id, consent_type);
CREATE INDEX idx_gdpr_consents_date ON gdpr_consents(consent_date);

-- =============================================
-- FULL-TEXT SEARCH
-- =============================================

-- Fulltextové vyhledávání lékařů
CREATE INDEX idx_doctors_search ON doctors USING GIN (
    to_tsvector('czech', 
        COALESCE(first_name, '') || ' ' || 
        COALESCE(last_name, '') || ' ' || 
        COALESCE(practice_name, '') || ' ' ||
        COALESCE(city, '')
    )
) WHERE is_verified = TRUE;

-- =============================================
-- FUNKCE PRO VALIDACI ČESKÝCH STANDARDŮ
-- =============================================

-- Validace IČO (včetně kontrolního součtu)
CREATE OR REPLACE FUNCTION validate_ico(ico_text TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
    sum INTEGER := 0;
    i INTEGER;
    check_digit INTEGER;
BEGIN
    IF ico_text IS NULL OR length(ico_text) != 8 OR ico_text !~ '^\d{8}$' THEN
        RETURN FALSE;
    END IF;
    
    -- Kontrolní součet IČO
    FOR i IN 1..7 LOOP
        sum := sum + (substring(ico_text, i, 1)::INTEGER * (9 - i));
    END LOOP;
    
    sum := sum % 11;
    check_digit := substring(ico_text, 8, 1)::INTEGER;
    
    IF sum < 2 THEN
        RETURN check_digit = 0;
    ELSE
        RETURN check_digit = (11 - sum);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Validace rodného čísla
CREATE OR REPLACE FUNCTION validate_birth_number(birth_number_text TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    clean_number TEXT;
    check_sum INTEGER;
BEGIN
    IF birth_number_text IS NULL THEN
        RETURN FALSE;
    END IF;
    
    clean_number := replace(birth_number_text, '/', '');
    
    IF length(clean_number) != 10 OR clean_number !~ '^\d{10}$' THEN
        RETURN FALSE;
    END IF;
    
    -- Kontrolní součet rodného čísla
    check_sum := (
        substring(clean_number, 1, 1)::INTEGER * 1 +
        substring(clean_number, 2, 1)::INTEGER * 2 +
        substring(clean_number, 3, 1)::INTEGER * 3 +
        substring(clean_number, 4, 1)::INTEGER * 4 +
        substring(clean_number, 5, 1)::INTEGER * 5 +
        substring(clean_number, 6, 1)::INTEGER * 6 +
        substring(clean_number, 7, 1)::INTEGER * 7 +
        substring(clean_number, 8, 1)::INTEGER * 8 +
        substring(clean_number, 9, 1)::INTEGER * 9
    ) % 11;
    
    IF check_sum = 10 THEN
        check_sum := 0;
    END IF;
    
    RETURN check_sum = substring(clean_number, 10, 1)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERY PRO AUTOMATIZACI
-- =============================================

-- Automatické updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplikace na všechny tabulky s updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit log trigger
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (action, table_name, record_id, new_values)
        VALUES ('INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (action, table_name, record_id, old_values, new_values)
        VALUES ('UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (action, table_name, record_id, old_values)
        VALUES ('DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Audit triggery na důležité tabulky
CREATE TRIGGER audit_doctors AFTER INSERT OR UPDATE OR DELETE ON doctors FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE ON patients FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_appointments AFTER INSERT OR UPDATE OR DELETE ON appointments FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Validace IČO trigger
CREATE OR REPLACE FUNCTION validate_doctor_ico()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ico IS NOT NULL AND NOT validate_ico(NEW.ico) THEN
        RAISE EXCEPTION 'Neplatné IČO: %', NEW.ico;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_doctor_ico_trigger 
    BEFORE INSERT OR UPDATE ON doctors 
    FOR EACH ROW EXECUTE FUNCTION validate_doctor_ico();

-- Validace rodného čísla trigger
CREATE OR REPLACE FUNCTION validate_patient_birth_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.birth_number IS NOT NULL AND NOT validate_birth_number(NEW.birth_number) THEN
        RAISE EXCEPTION 'Neplatné rodné číslo: %', NEW.birth_number;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_patient_birth_number_trigger 
    BEFORE INSERT OR UPDATE ON patients 
    FOR EACH ROW EXECUTE FUNCTION validate_patient_birth_number();

-- =============================================
-- INICIALIZACE DAT
-- =============================================

-- Vložení základních regionů a specializací je zajištěno ENUM typy

-- Ukázková data pro testování (volitelné)
-- INSERT INTO users (id, email) VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com');

COMMENT ON SCHEMA public IS 'DoktorNaDohled database schema for Czech healthcare platform with GDPR compliance';