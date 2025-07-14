-- DoktorNaDohled RLS Policies for GDPR Compliance
-- Row Level Security pro českou zdravotnickou platformu

-- =============================================
-- AKTIVACE RLS PRO VŠECHNY TABULKY
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNKCE PRO RLS
-- =============================================

-- Získání ID aktuálního uživatele z Supabase Auth
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS UUID AS $$
  SELECT auth.uid()
$$ LANGUAGE sql STABLE;

-- Kontrola, zda je uživatel lékař
CREATE OR REPLACE FUNCTION is_doctor(user_uuid UUID DEFAULT auth.user_id())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM doctors 
    WHERE user_id = user_uuid 
    AND is_verified = TRUE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Kontrola, zda je uživatel pacient
CREATE OR REPLACE FUNCTION is_patient(user_uuid UUID DEFAULT auth.user_id())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM patients 
    WHERE user_id = user_uuid 
    AND gdpr_consent = TRUE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Kontrola, zda je uživatel admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.user_id())
RETURNS BOOLEAN AS $$
  SELECT auth.jwt() ->> 'role' = 'admin' OR 
         auth.jwt() -> 'app_metadata' ->> 'role' = 'admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Kontrola GDPR souhlasu uživatele
CREATE OR REPLACE FUNCTION has_gdpr_consent(user_uuid UUID, consent_type TEXT DEFAULT 'chat')
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM gdpr_consents 
    WHERE user_id = user_uuid 
    AND consent_type::TEXT = $2
    AND consented = TRUE 
    AND withdrawal_date IS NULL
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Získání ID pacienta pro daného uživatele
CREATE OR REPLACE FUNCTION get_patient_id(user_uuid UUID DEFAULT auth.user_id())
RETURNS UUID AS $$
  SELECT id FROM patients WHERE user_id = user_uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Získání ID lékaře pro daného uživatele
CREATE OR REPLACE FUNCTION get_doctor_id(user_uuid UUID DEFAULT auth.user_id())
RETURNS UUID AS $$
  SELECT id FROM doctors WHERE user_id = user_uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Kontrola, zda má lékař přístup k pacientovi (prostřednictvím schůzky)
CREATE OR REPLACE FUNCTION doctor_has_patient_access(doctor_uuid UUID, patient_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    JOIN patients p ON a.patient_id = p.id
    WHERE d.user_id = doctor_uuid 
    AND p.user_id = patient_uuid
    AND a.status IN ('confirmed', 'completed')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================
-- RLS POLICIES - USERS TABLE
-- =============================================

-- Uživatelé vidí pouze své vlastní záznamy
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (id = auth.user_id());

-- Uživatelé mohou upravovat své vlastní záznamy
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = auth.user_id());

-- Admin může zobrazit všechny uživatele
CREATE POLICY "Admins can view all users" ON users
    FOR ALL USING (is_admin());

-- =============================================
-- RLS POLICIES - DOCTORS TABLE
-- =============================================

-- Veřejné zobrazení ověřených lékařů (pro vyhledávání)
CREATE POLICY "Public can view verified doctors" ON doctors
    FOR SELECT USING (is_verified = TRUE);

-- Lékaři mohou upravovat své vlastní profily
CREATE POLICY "Doctors can update own profile" ON doctors
    FOR UPDATE USING (user_id = auth.user_id());

-- Lékaři mohou vložit svůj profil
CREATE POLICY "Doctors can insert own profile" ON doctors
    FOR INSERT WITH CHECK (user_id = auth.user_id());

-- Admin může spravovat všechny lékaře
CREATE POLICY "Admins can manage all doctors" ON doctors
    FOR ALL USING (is_admin());

-- =============================================
-- RLS POLICIES - PATIENTS TABLE
-- =============================================

-- Pacienti vidí pouze své vlastní záznamy
CREATE POLICY "Patients can view own profile" ON patients
    FOR SELECT USING (user_id = auth.user_id());

-- Pacienti mohou upravovat své vlastní záznamy
CREATE POLICY "Patients can update own profile" ON patients
    FOR UPDATE USING (user_id = auth.user_id());

-- Pacienti mohou vytvořit svůj profil (s GDPR souhlasem)
CREATE POLICY "Patients can insert own profile" ON patients
    FOR INSERT WITH CHECK (
        user_id = auth.user_id() 
        AND gdpr_consent = TRUE
    );

-- Lékaři mohou zobrazit pacienty, se kterými mají schůzku
CREATE POLICY "Doctors can view their patients" ON patients
    FOR SELECT USING (
        is_doctor() AND
        doctor_has_patient_access(auth.user_id(), user_id)
    );

-- Admin může spravovat všechny pacienty
CREATE POLICY "Admins can manage all patients" ON patients
    FOR ALL USING (is_admin());

-- =============================================
-- RLS POLICIES - APPOINTMENTS TABLE
-- =============================================

-- Pacienti vidí své vlastní schůzky
CREATE POLICY "Patients can view own appointments" ON appointments
    FOR SELECT USING (
        patient_id = get_patient_id(auth.user_id())
    );

-- Lékaři vidí své vlastní schůzky
CREATE POLICY "Doctors can view own appointments" ON appointments
    FOR SELECT USING (
        doctor_id = get_doctor_id(auth.user_id())
    );

-- Pacienti mohou vytvořit schůzky (pouze pro sebe)
CREATE POLICY "Patients can create own appointments" ON appointments
    FOR INSERT WITH CHECK (
        patient_id = get_patient_id(auth.user_id()) AND
        has_gdpr_consent(auth.user_id(), 'booking')
    );

-- Pacienti mohou upravovat své budoucí schůzky
CREATE POLICY "Patients can update own future appointments" ON appointments
    FOR UPDATE USING (
        patient_id = get_patient_id(auth.user_id()) AND
        scheduled_datetime > NOW() AND
        status IN ('scheduled', 'confirmed')
    );

-- Lékaři mohou upravovat své schůzky
CREATE POLICY "Doctors can update own appointments" ON appointments
    FOR UPDATE USING (
        doctor_id = get_doctor_id(auth.user_id())
    );

-- Lékaři mohou mazat pouze nezačaté schůzky
CREATE POLICY "Doctors can cancel future appointments" ON appointments
    FOR DELETE USING (
        doctor_id = get_doctor_id(auth.user_id()) AND
        scheduled_datetime > NOW() + INTERVAL '1 hour' AND
        status NOT IN ('in_progress', 'completed')
    );

-- Admin může spravovat všechny schůzky
CREATE POLICY "Admins can manage all appointments" ON appointments
    FOR ALL USING (is_admin());

-- =============================================
-- RLS POLICIES - CHAT CONVERSATIONS
-- =============================================

-- Uživatelé vidí pouze své vlastní konverzace
CREATE POLICY "Users can view own conversations" ON chat_conversations
    FOR SELECT USING (
        user_id = auth.user_id() AND
        has_gdpr_consent(auth.user_id(), 'chat')
    );

-- Uživatelé mohou vytvářet konverzace (se souhlasem)
CREATE POLICY "Users can create conversations" ON chat_conversations
    FOR INSERT WITH CHECK (
        user_id = auth.user_id() AND
        has_gdpr_consent(auth.user_id(), 'chat')
    );

-- Uživatelé mohou upravovat své aktivní konverzace
CREATE POLICY "Users can update own active conversations" ON chat_conversations
    FOR UPDATE USING (
        user_id = auth.user_id() AND
        ended_at IS NULL
    );

-- Admin může zobrazit anonymizované konverzace pro vylepšení služby
CREATE POLICY "Admins can view anonymized conversations" ON chat_conversations
    FOR SELECT USING (
        is_admin() AND anonymized = TRUE
    );

-- =============================================
-- RLS POLICIES - CHAT MESSAGES
-- =============================================

-- Uživatelé vidí zprávy ze svých konverzací
CREATE POLICY "Users can view own chat messages" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_conversations cc
            WHERE cc.id = conversation_id 
            AND cc.user_id = auth.user_id()
            AND has_gdpr_consent(auth.user_id(), 'chat')
        )
    );

-- Uživatelé mohou přidávat zprávy do svých konverzací
CREATE POLICY "Users can insert own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_conversations cc
            WHERE cc.id = conversation_id 
            AND cc.user_id = auth.user_id()
            AND cc.ended_at IS NULL
        )
    );

-- =============================================
-- RLS POLICIES - REVIEWS
-- =============================================

-- Veřejné zobrazení ověřených recenzí
CREATE POLICY "Public can view verified reviews" ON reviews
    FOR SELECT USING (is_verified = TRUE AND is_public = TRUE);

-- Pacienti mohou vytvářet recenze pro své dokončené schůzky
CREATE POLICY "Patients can create reviews for completed appointments" ON reviews
    FOR INSERT WITH CHECK (
        patient_id = get_patient_id(auth.user_id()) AND
        EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.id = appointment_id 
            AND a.patient_id = patient_id
            AND a.status = 'completed'
        )
    );

-- Pacienti vidí své vlastní recenze
CREATE POLICY "Patients can view own reviews" ON reviews
    FOR SELECT USING (patient_id = get_patient_id(auth.user_id()));

-- Lékaři vidí recenze na svůj profil
CREATE POLICY "Doctors can view own reviews" ON reviews
    FOR SELECT USING (doctor_id = get_doctor_id(auth.user_id()));

-- Admin může spravovat všechny recenze
CREATE POLICY "Admins can manage all reviews" ON reviews
    FOR ALL USING (is_admin());

-- =============================================
-- RLS POLICIES - GDPR CONSENTS
-- =============================================

-- Uživatelé vidí pouze své vlastní souhlasy
CREATE POLICY "Users can view own consents" ON gdpr_consents
    FOR SELECT USING (user_id = auth.user_id());

-- Uživatelé mohou spravovat své souhlasy
CREATE POLICY "Users can manage own consents" ON gdpr_consents
    FOR ALL USING (user_id = auth.user_id());

-- Admin může zobrazit všechny souhlasy (pro compliance)
CREATE POLICY "Admins can view all consents for compliance" ON gdpr_consents
    FOR SELECT USING (is_admin());

-- =============================================
-- RLS POLICIES - AUDIT LOGS
-- =============================================

-- Uživatelé mohou zobrazit audit logy svých dat
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (user_id = auth.user_id());

-- Admin může zobrazit všechny audit logy
CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (is_admin());

-- Systém může vkládat audit logy
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (TRUE);

-- =============================================
-- SECURITY DEFINER FUNKCE PRO SAFE OPERATIONS
-- =============================================

-- Bezpečné získání veřejných informací o lékaři
CREATE OR REPLACE FUNCTION get_public_doctor_info(doctor_id UUID)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    specialization specialization_enum,
    city TEXT,
    region czech_region_enum,
    rating DECIMAL,
    review_count INTEGER,
    accepts_new_patients BOOLEAN,
    has_online_booking BOOLEAN,
    telemedicine_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.first_name,
        d.last_name,
        d.specialization,
        d.city,
        d.region,
        d.rating,
        d.review_count,
        d.accepts_new_patients,
        d.has_online_booking,
        d.telemedicine_available
    FROM doctors d
    WHERE d.id = doctor_id 
    AND d.is_verified = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bezpečné vyhledávání lékařů (bez citlivých dat)
CREATE OR REPLACE FUNCTION search_doctors(
    search_specialization specialization_enum DEFAULT NULL,
    search_region czech_region_enum DEFAULT NULL,
    search_city TEXT DEFAULT NULL,
    accepts_new_patients_only BOOLEAN DEFAULT TRUE,
    limit_results INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    specialization specialization_enum,
    city TEXT,
    region czech_region_enum,
    rating DECIMAL,
    review_count INTEGER,
    accepts_new_patients BOOLEAN,
    has_online_booking BOOLEAN,
    telemedicine_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.first_name,
        d.last_name,
        d.specialization,
        d.city,
        d.region,
        d.rating,
        d.review_count,
        d.accepts_new_patients,
        d.has_online_booking,
        d.telemedicine_available
    FROM doctors d
    WHERE d.is_verified = TRUE
    AND (search_specialization IS NULL OR d.specialization = search_specialization)
    AND (search_region IS NULL OR d.region = search_region)
    AND (search_city IS NULL OR d.city ILIKE '%' || search_city || '%')
    AND (NOT accepts_new_patients_only OR d.accepts_new_patients = TRUE)
    ORDER BY d.rating DESC NULLS LAST, d.review_count DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bezpečné získání dostupných termínů
CREATE OR REPLACE FUNCTION get_doctor_availability(
    doctor_id UUID,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT CURRENT_DATE + INTERVAL '30 days'
)
RETURNS TABLE (
    available_datetime TIMESTAMPTZ,
    duration_minutes INTEGER
) AS $$
BEGIN
    -- Tato funkce by měla implementovat logiku dostupnosti
    -- založenou na working_hours a existujících schůzkách
    RETURN QUERY
    SELECT 
        generate_series(
            start_date::TIMESTAMPTZ + INTERVAL '9 hours',
            end_date::TIMESTAMPTZ + INTERVAL '17 hours',
            INTERVAL '30 minutes'
        ) AS available_datetime,
        30 AS duration_minutes
    WHERE NOT EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.doctor_id = get_doctor_availability.doctor_id
        AND a.scheduled_datetime = generate_series
        AND a.status NOT IN ('cancelled', 'no_show')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- GDPR COMPLIANCE FUNKCE
-- =============================================

-- Anonymizace uživatelských dat
CREATE OR REPLACE FUNCTION anonymize_user_data(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Může být spuštěno pouze vlastníkem dat nebo adminem
    IF user_uuid != auth.user_id() AND NOT is_admin() THEN
        RAISE EXCEPTION 'Nemáte oprávnění anonymizovat tato data';
    END IF;

    -- Anonymizace pacientských dat
    UPDATE patients SET
        first_name = 'Anonymní',
        last_name = 'Uživatel',
        phone = NULL,
        birth_number = NULL,
        street_address = NULL,
        city = NULL,
        postal_code = NULL,
        emergency_contact = NULL,
        allergies = ARRAY[]::TEXT[],
        chronic_conditions = ARRAY[]::TEXT[],
        current_medications = ARRAY[]::TEXT[]
    WHERE user_id = user_uuid;

    -- Označení chat konverzací jako anonymizované
    UPDATE chat_conversations SET
        anonymized = TRUE
    WHERE user_id = user_uuid;

    -- Výmaz citlivých chat zpráv
    DELETE FROM chat_messages 
    WHERE conversation_id IN (
        SELECT id FROM chat_conversations WHERE user_id = user_uuid
    ) AND safety_flagged = FALSE;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Výmaz všech uživatelských dat (right to be forgotten)
CREATE OR REPLACE FUNCTION delete_user_data(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Může být spuštěno pouze vlastníkem dat nebo adminem
    IF user_uuid != auth.user_id() AND NOT is_admin() THEN
        RAISE EXCEPTION 'Nemáte oprávnění smazat tato data';
    END IF;

    -- Soft delete - označení k výmazu
    UPDATE users SET 
        is_active = FALSE,
        data_retention_until = NOW()
    WHERE id = user_uuid;

    -- Anonymizace místo přímého výmazu (compliance)
    PERFORM anonymize_user_data(user_uuid);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Veřejný přístup k vyhledávacím funkcím
GRANT EXECUTE ON FUNCTION get_public_doctor_info(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_doctors(specialization_enum, czech_region_enum, TEXT, BOOLEAN, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_doctor_availability(UUID, DATE, DATE) TO authenticated;

-- Přístup k GDPR funkcím pouze pro authenticated uživatele
GRANT EXECUTE ON FUNCTION anonymize_user_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_data(UUID) TO authenticated;

-- Přístup k helper funkcím
GRANT EXECUTE ON FUNCTION is_doctor(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_patient(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_gdpr_consent(UUID, TEXT) TO authenticated;

COMMENT ON SCHEMA public IS 'DoktorNaDohled RLS policies ensuring GDPR compliance and proper data access control for Czech healthcare platform';