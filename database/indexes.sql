-- Databázové indexy pro DoktorNaDohled - České zdravotnické optimalizace
-- Optimalizuje vyhledávání lékařů podle specializace, regionu, pojišťoven a další kritéria

-- ===================================================================
-- INDEXY PRO DOCTORS TABULKU
-- ===================================================================

-- Hlavní indexy pro vyhledávání lékařů
CREATE INDEX IF NOT EXISTS idx_doctors_specialization 
ON doctors (specialization);

CREATE INDEX IF NOT EXISTS idx_doctors_region 
ON doctors (region);

CREATE INDEX IF NOT EXISTS idx_doctors_city 
ON doctors (city);

CREATE INDEX IF NOT EXISTS idx_doctors_postal_code 
ON doctors (postal_code);

-- Kompozitní index pro vyhledávání podle specializace a regionu
CREATE INDEX IF NOT EXISTS idx_doctors_spec_region 
ON doctors (specialization, region);

-- Index pro vyhledávání podle specializace a města
CREATE INDEX IF NOT EXISTS idx_doctors_spec_city 
ON doctors (specialization, city);

-- Index pro aktivní lékaře s licencí
CREATE INDEX IF NOT EXISTS idx_doctors_active_licensed 
ON doctors (is_active, license_verified) 
WHERE is_active = true AND license_verified = true;

-- Index pro vyhledávání podle pojišťoven
CREATE INDEX IF NOT EXISTS idx_doctors_insurance 
ON doctors USING GIN (accepted_insurances);

-- Full-text search index pro jména lékařů
CREATE INDEX IF NOT EXISTS idx_doctors_fulltext 
ON doctors USING GIN (
  to_tsvector('czech', first_name || ' ' || last_name || ' ' || specialization)
);

-- Index pro geografické vyhledávání (pokud máme lat/lng)
CREATE INDEX IF NOT EXISTS idx_doctors_location 
ON doctors (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Index pro hodnocení lékařů
CREATE INDEX IF NOT EXISTS idx_doctors_rating 
ON doctors (average_rating DESC) 
WHERE average_rating IS NOT NULL;

-- ===================================================================
-- INDEXY PRO APPOINTMENTS TABULKU
-- ===================================================================

-- Index pro vyhledávání termínů podle lékaře a data
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date 
ON appointments (doctor_id, appointment_date);

-- Index pro pacienty a jejich termíny
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date 
ON appointments (patient_id, appointment_date);

-- Index pro status termínů
CREATE INDEX IF NOT EXISTS idx_appointments_status 
ON appointments (status);

-- Index pro nadcházející termíny
CREATE INDEX IF NOT EXISTS idx_appointments_upcoming 
ON appointments (appointment_date) 
WHERE appointment_date >= CURRENT_DATE AND status IN ('scheduled', 'confirmed');

-- Kompozitní index pro dostupnost lékařů
CREATE INDEX IF NOT EXISTS idx_appointments_availability 
ON appointments (doctor_id, appointment_date, status);

-- Index pro zrušené termíny
CREATE INDEX IF NOT EXISTS idx_appointments_cancelled 
ON appointments (doctor_id, appointment_date) 
WHERE status = 'cancelled';

-- ===================================================================
-- INDEXY PRO CHAT_CONVERSATIONS TABULKU
-- ===================================================================

-- Index pro konverzace podle uživatele
CREATE INDEX IF NOT EXISTS idx_chat_user_id 
ON chat_conversations (user_id);

-- Index pro aktivní konverzace
CREATE INDEX IF NOT EXISTS idx_chat_active 
ON chat_conversations (is_active) 
WHERE is_active = true;

-- Index pro anonymizované konverzace (GDPR)
CREATE INDEX IF NOT EXISTS idx_chat_anonymized 
ON chat_conversations (anonymized);

-- Index pro datum vytvoření (pro čištění starých dat)
CREATE INDEX IF NOT EXISTS idx_chat_created_at 
ON chat_conversations (created_at);

-- Full-text search pro obsah konverzací
CREATE INDEX IF NOT EXISTS idx_chat_content_search 
ON chat_conversations USING GIN (
  to_tsvector('czech', title || ' ' || COALESCE(summary, ''))
);

-- ===================================================================
-- INDEXY PRO GDPR_CONSENT TABULKU
-- ===================================================================

-- Index pro consent podle uživatele
CREATE INDEX IF NOT EXISTS idx_gdpr_user_id 
ON gdpr_consent (user_id);

-- Index pro typ consent
CREATE INDEX IF NOT EXISTS idx_gdpr_consent_type 
ON gdpr_consent (consent_type);

-- Index pro aktuální consent (nejnovější)
CREATE INDEX IF NOT EXISTS idx_gdpr_current_consent 
ON gdpr_consent (user_id, consent_type, created_at DESC);

-- Index pro audit podle data
CREATE INDEX IF NOT EXISTS idx_gdpr_created_at 
ON gdpr_consent (created_at);

-- ===================================================================
-- INDEXY PRO USER_PROFILES TABULKU
-- ===================================================================

-- Index pro vyhledávání podle pojišťovny
CREATE INDEX IF NOT EXISTS idx_profiles_insurance 
ON user_profiles (insurance_provider);

-- Index pro pacienty podle regionu
CREATE INDEX IF NOT EXISTS idx_profiles_region 
ON user_profiles (region);

-- Index pro typ uživatele
CREATE INDEX IF NOT EXISTS idx_profiles_user_type 
ON user_profiles (user_type);

-- Index pro datum narození (pro věkové skupiny)
CREATE INDEX IF NOT EXISTS idx_profiles_birth_date 
ON user_profiles (birth_date) 
WHERE birth_date IS NOT NULL;

-- ===================================================================
-- INDEXY PRO DOCTOR_AVAILABILITY TABULKU
-- ===================================================================

-- Index pro dostupnost podle lékaře a data
CREATE INDEX IF NOT EXISTS idx_availability_doctor_date 
ON doctor_availability (doctor_id, date);

-- Index pro dostupné termíny
CREATE INDEX IF NOT EXISTS idx_availability_slots 
ON doctor_availability (doctor_id, date, is_available) 
WHERE is_available = true;

-- Index pro pracovní dny
CREATE INDEX IF NOT EXISTS idx_availability_working_days 
ON doctor_availability (day_of_week, is_available) 
WHERE is_available = true;

-- ===================================================================
-- INDEXY PRO MEDICAL_RECORDS TABULKU
-- ===================================================================

-- Index pro zdravotní záznamy podle pacienta
CREATE INDEX IF NOT EXISTS idx_medical_patient_id 
ON medical_records (patient_id);

-- Index pro záznamy podle lékaře
CREATE INDEX IF NOT EXISTS idx_medical_doctor_id 
ON medical_records (doctor_id);

-- Index pro datum záznamu
CREATE INDEX IF NOT EXISTS idx_medical_record_date 
ON medical_records (record_date);

-- Index pro typ záznamu
CREATE INDEX IF NOT EXISTS idx_medical_record_type 
ON medical_records (record_type);

-- Full-text search pro obsah záznamů
CREATE INDEX IF NOT EXISTS idx_medical_content_search 
ON medical_records USING GIN (
  to_tsvector('czech', COALESCE(diagnosis, '') || ' ' || COALESCE(notes, ''))
);

-- ===================================================================
-- INDEXY PRO REVIEWS TABULKU
-- ===================================================================

-- Index pro recenze podle lékaře
CREATE INDEX IF NOT EXISTS idx_reviews_doctor_id 
ON reviews (doctor_id);

-- Index pro recenze podle pacienta
CREATE INDEX IF NOT EXISTS idx_reviews_patient_id 
ON reviews (patient_id);

-- Index pro hodnocení
CREATE INDEX IF NOT EXISTS idx_reviews_rating 
ON reviews (rating);

-- Index pro datum recenze
CREATE INDEX IF NOT EXISTS idx_reviews_created_at 
ON reviews (created_at);

-- Kompozitní index pro průměrné hodnocení
CREATE INDEX IF NOT EXISTS idx_reviews_doctor_rating 
ON reviews (doctor_id, rating, created_at);

-- ===================================================================
-- INDEXY PRO AUDIT_LOGS TABULKU
-- ===================================================================

-- Index pro audit podle akce
CREATE INDEX IF NOT EXISTS idx_audit_action 
ON audit_logs (action);

-- Index pro audit podle entity
CREATE INDEX IF NOT EXISTS idx_audit_entity_type 
ON audit_logs (entity_type);

-- Index pro audit podle uživatele
CREATE INDEX IF NOT EXISTS idx_audit_user_id 
ON audit_logs (user_id) 
WHERE user_id IS NOT NULL;

-- Index pro datum (pro archivaci)
CREATE INDEX IF NOT EXISTS idx_audit_timestamp 
ON audit_logs (timestamp);

-- ===================================================================
-- SPECIALIZOVANÉ INDEXY PRO ČESKÉ ZDRAVOTNICTVÍ
-- ===================================================================

-- Index pro českých lékařů podle ČLK registru
CREATE INDEX IF NOT EXISTS idx_doctors_clk_registration 
ON doctors (clk_registration_number) 
WHERE clk_registration_number IS NOT NULL;

-- Index pro IČO zdravotnických zařízení
CREATE INDEX IF NOT EXISTS idx_doctors_ico 
ON doctors (practice_ico) 
WHERE practice_ico IS NOT NULL;

-- Index pro rodná čísla pacientů (pouze pro Czech healthcare)
CREATE INDEX IF NOT EXISTS idx_profiles_birth_number 
ON user_profiles (birth_number) 
WHERE birth_number IS NOT NULL;

-- Index pro česká PSČ
CREATE INDEX IF NOT EXISTS idx_doctors_czech_postal 
ON doctors (postal_code) 
WHERE postal_code ~ '^[1-9][0-9]{4}$';

-- ===================================================================
-- PARCIÁLNÍ INDEXY PRO OPTIMALIZACI
-- ===================================================================

-- Index pouze pro aktivní lékaře s termíny
CREATE INDEX IF NOT EXISTS idx_doctors_active_with_appointments 
ON doctors (id, specialization, region) 
WHERE is_active = true 
  AND id IN (
    SELECT DISTINCT doctor_id 
    FROM doctor_availability 
    WHERE is_available = true 
      AND date >= CURRENT_DATE
  );

-- Index pro urgentní případy
CREATE INDEX IF NOT EXISTS idx_appointments_emergency 
ON appointments (doctor_id, appointment_date, created_at) 
WHERE priority = 'emergency' OR priority = 'urgent';

-- Index pro telemedicínské konzultace
CREATE INDEX IF NOT EXISTS idx_appointments_telemedicine 
ON appointments (doctor_id, appointment_date) 
WHERE consultation_type = 'telemedicine';

-- ===================================================================
-- INDEXY PRO STATISTIKY A REPORTING
-- ===================================================================

-- Index pro měsíční statistiky termínů
CREATE INDEX IF NOT EXISTS idx_appointments_monthly_stats 
ON appointments (
  EXTRACT(YEAR FROM appointment_date),
  EXTRACT(MONTH FROM appointment_date),
  status
);

-- Index pro denní statistiky lékařů
CREATE INDEX IF NOT EXISTS idx_doctors_daily_stats 
ON appointments (
  doctor_id,
  DATE(appointment_date),
  status
);

-- Index pro pojišťovna analýzy
CREATE INDEX IF NOT EXISTS idx_profiles_insurance_stats 
ON user_profiles (insurance_provider, user_type, created_at);

-- ===================================================================
-- MAINTENANCE SKRIPTY
-- ===================================================================

-- Funkce pro sledování využití indexů
CREATE OR REPLACE FUNCTION check_index_usage() 
RETURNS TABLE (
  index_name TEXT,
  table_name TEXT,
  index_size TEXT,
  index_scans BIGINT,
  tuples_read BIGINT,
  tuples_fetched BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.indexrelname::TEXT,
    s.relname::TEXT,
    pg_size_pretty(pg_relation_size(s.indexrelid))::TEXT,
    s.idx_scan,
    s.idx_tup_read,
    s.idx_tup_fetch
  FROM pg_stat_user_indexes s
  JOIN pg_index i ON s.indexrelid = i.indexrelid
  WHERE s.schemaname = 'public'
  ORDER BY s.idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Funkce pro cleanup starých dat
CREATE OR REPLACE FUNCTION cleanup_old_data(months_to_keep INTEGER DEFAULT 24)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  cutoff_date DATE;
BEGIN
  cutoff_date := CURRENT_DATE - INTERVAL '1 month' * months_to_keep;
  
  -- Smazání starých audit logů
  DELETE FROM audit_logs 
  WHERE timestamp < cutoff_date 
    AND action NOT IN ('data_deletion', 'consent_revoked');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Anonymizace starých chat konverzací
  UPDATE chat_conversations 
  SET anonymized = true,
      title = 'Anonymizováno',
      summary = NULL
  WHERE created_at < cutoff_date 
    AND anonymized = false;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- KOMENTÁŘE A DOKUMENTACE
-- ===================================================================

COMMENT ON INDEX idx_doctors_specialization IS 'Hlavní index pro vyhledávání lékařů podle specializace';
COMMENT ON INDEX idx_doctors_spec_region IS 'Kompozitní index pro rychlé vyhledávání podle specializace a regionu';
COMMENT ON INDEX idx_doctors_fulltext IS 'Full-text search index pro vyhledávání lékařů v češtině';
COMMENT ON INDEX idx_appointments_doctor_date IS 'Index pro rychlé načítání termínů lékaře podle data';
COMMENT ON INDEX idx_gdpr_current_consent IS 'Index pro získání aktuálního GDPR consent stavu uživatele';
COMMENT ON FUNCTION check_index_usage() IS 'Funkce pro monitorování využití databázových indexů';
COMMENT ON FUNCTION cleanup_old_data(INTEGER) IS 'Funkce pro automatické čištění starých dat podle GDPR požadavků';

-- ===================================================================
-- VÝKONNOSTNÍ OPTIMALIZACE
-- ===================================================================

-- Nastavení pro optimalizaci českých znaků
SET default_text_search_config = 'czech';

-- Doporučená nastavení pro PostgreSQL
-- Přidat do postgresql.conf:
-- shared_preload_libraries = 'pg_stat_statements'
-- pg_stat_statements.track = all
-- log_statement = 'all'
-- log_min_duration_statement = 1000

-- Analyzování tabulek pro aktualizaci statistik
ANALYZE doctors;
ANALYZE appointments;
ANALYZE user_profiles;
ANALYZE chat_conversations;
ANALYZE gdpr_consent;
ANALYZE medical_records;
ANALYZE reviews;
ANALYZE audit_logs;