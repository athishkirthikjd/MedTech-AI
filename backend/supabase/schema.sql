-- =====================================================
-- MedTech AI - Smart Hospital Assistant
-- Supabase Database Schema
-- =====================================================
-- Run this in Supabase SQL Editor to create all tables
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');

-- Appointment status
CREATE TYPE appointment_status AS ENUM (
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show'
);

-- Appointment type
CREATE TYPE appointment_type AS ENUM ('video', 'in_person', 'phone');

-- Prescription status
CREATE TYPE prescription_status AS ENUM ('active', 'completed', 'cancelled', 'expired');

-- Vitals source
CREATE TYPE vitals_source AS ENUM ('manual', 'device', 'wearable', 'clinic');

-- Emergency type
CREATE TYPE emergency_type AS ENUM (
    'medical',
    'cardiac',
    'breathing',
    'fall',
    'accident',
    'other'
);

-- Emergency status
CREATE TYPE emergency_status AS ENUM (
    'triggered',
    'acknowledged',
    'dispatched',
    'resolved',
    'cancelled'
);

-- Emergency severity
CREATE TYPE emergency_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supabase_uid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'patient',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for Supabase UID lookups
CREATE INDEX idx_users_supabase_uid ON users(supabase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- PATIENTS TABLE
-- =====================================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender TEXT,
    blood_type TEXT,
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    allergies TEXT[] DEFAULT '{}',
    chronic_conditions TEXT[] DEFAULT '{}',
    current_medications TEXT[] DEFAULT '{}',
    
    -- Emergency contact
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    
    -- Insurance info (JSONB for flexibility)
    insurance_info JSONB DEFAULT '{}',
    
    -- Address
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'India',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_user_id ON patients(user_id);

-- =====================================================
-- DOCTORS TABLE
-- =====================================================
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Professional info
    specialty TEXT NOT NULL,
    qualifications TEXT,
    license_number TEXT,
    years_of_experience INTEGER DEFAULT 0,
    
    -- Affiliation
    hospital_affiliation TEXT,
    clinic_address TEXT,
    
    -- Consultation
    consultation_fee NUMERIC(10,2) DEFAULT 0,
    follow_up_fee NUMERIC(10,2) DEFAULT 0,
    
    -- Availability (JSONB for weekly schedule)
    -- Format: {"monday": {"available": true, "start": "09:00", "end": "17:00"}, ...}
    availability_schedule JSONB DEFAULT '{}',
    is_available BOOLEAN NOT NULL DEFAULT true,
    
    -- Languages & skills
    languages_spoken TEXT[] DEFAULT '{"English", "Hindi"}',
    
    -- Ratings
    average_rating NUMERIC(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    
    -- Bio
    bio TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_specialty ON doctors(specialty);
CREATE INDEX idx_doctors_is_available ON doctors(is_available);
CREATE INDEX idx_doctors_rating ON doctors(average_rating DESC);

-- =====================================================
-- APPOINTMENTS TABLE
-- =====================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    appointment_type appointment_type NOT NULL DEFAULT 'video',
    
    -- Status
    status appointment_status NOT NULL DEFAULT 'scheduled',
    
    -- Details
    reason TEXT,
    symptoms TEXT[],
    notes TEXT,
    
    -- For video consultations
    meeting_link TEXT,
    
    -- Fees
    fee_amount NUMERIC(10,2),
    fee_paid BOOLEAN DEFAULT false,
    payment_id TEXT,
    
    -- Cancellation
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    
    -- Completion
    completed_at TIMESTAMPTZ,
    doctor_notes TEXT,
    prescription_id UUID,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);

-- =====================================================
-- PRESCRIPTIONS TABLE
-- =====================================================
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Diagnosis
    diagnosis TEXT,
    diagnosis_code TEXT,
    
    -- Medications (JSONB array)
    -- Format: [{"name": "...", "dosage": "...", "frequency": "...", "duration": "...", "instructions": "..."}]
    medications JSONB NOT NULL DEFAULT '[]',
    
    -- Additional
    notes TEXT,
    follow_up_date DATE,
    
    -- Status
    status prescription_status NOT NULL DEFAULT 'active',
    
    -- Validity
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    
    -- Digital signature
    doctor_signature TEXT,
    signed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- =====================================================
-- VITALS RECORDS TABLE
-- =====================================================
CREATE TABLE vitals_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Blood Pressure
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    
    -- Heart
    heart_rate INTEGER,
    
    -- Oxygen
    spo2 INTEGER,
    
    -- Temperature (Celsius)
    temperature NUMERIC(4,1),
    
    -- Blood Sugar
    glucose INTEGER,
    
    -- Body measurements
    weight NUMERIC(5,2),
    height NUMERIC(5,2),
    
    -- Respiratory
    respiratory_rate INTEGER,
    
    -- Source
    source vitals_source NOT NULL DEFAULT 'manual',
    device_id TEXT,
    
    -- Notes
    notes TEXT,
    
    -- When recorded
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vitals_patient_id ON vitals_records(patient_id);
CREATE INDEX idx_vitals_recorded_at ON vitals_records(recorded_at DESC);

-- =====================================================
-- EMERGENCY EVENTS TABLE
-- =====================================================
CREATE TABLE emergency_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Emergency details
    emergency_type emergency_type NOT NULL DEFAULT 'medical',
    description TEXT,
    
    -- Location
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    address TEXT,
    
    -- Severity
    severity emergency_severity NOT NULL DEFAULT 'medium',
    
    -- Status
    status emergency_status NOT NULL DEFAULT 'triggered',
    
    -- AI Analysis (JSONB for flexibility)
    ai_analysis JSONB DEFAULT '{}',
    
    -- Timestamps
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    
    -- Responder info
    responder_id UUID REFERENCES users(id),
    responder_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emergency_patient_id ON emergency_events(patient_id);
CREATE INDEX idx_emergency_status ON emergency_events(status);
CREATE INDEX idx_emergency_triggered_at ON emergency_events(triggered_at DESC);
CREATE INDEX idx_emergency_severity ON emergency_events(severity);

-- =====================================================
-- CHAT MESSAGES TABLE (for AI chat history)
-- =====================================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    
    -- Message content
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    
    -- AI analysis attached (for symptom checks)
    ai_analysis JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_created_at ON chat_messages(created_at DESC);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vitals_updated_at BEFORE UPDATE ON vitals_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_updated_at BEFORE UPDATE ON emergency_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = supabase_uid);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = supabase_uid);

-- Patients can manage their own records
CREATE POLICY "Patients can view own records" ON patients
    FOR SELECT USING (
        user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()::text)
    );

CREATE POLICY "Patients can update own records" ON patients
    FOR UPDATE USING (
        user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()::text)
    );

-- Doctors can view their own profile
CREATE POLICY "Doctors can view own profile" ON doctors
    FOR SELECT USING (
        user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()::text)
    );

-- Anyone can view available doctors (for booking)
CREATE POLICY "Anyone can view available doctors" ON doctors
    FOR SELECT USING (is_available = true);

-- Patients can view their appointments
CREATE POLICY "Patients can view own appointments" ON appointments
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id IN (
                SELECT id FROM users WHERE supabase_uid = auth.uid()::text
            )
        )
    );

-- Doctors can view their appointments
CREATE POLICY "Doctors can view their appointments" ON appointments
    FOR SELECT USING (
        doctor_id IN (
            SELECT id FROM doctors WHERE user_id IN (
                SELECT id FROM users WHERE supabase_uid = auth.uid()::text
            )
        )
    );

-- Patients can view their vitals
CREATE POLICY "Patients can manage own vitals" ON vitals_records
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id IN (
                SELECT id FROM users WHERE supabase_uid = auth.uid()::text
            )
        )
    );

-- Patients can view their prescriptions
CREATE POLICY "Patients can view own prescriptions" ON prescriptions
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id IN (
                SELECT id FROM users WHERE supabase_uid = auth.uid()::text
            )
        )
    );

-- Patients can manage their emergencies
CREATE POLICY "Patients can manage own emergencies" ON emergency_events
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id IN (
                SELECT id FROM users WHERE supabase_uid = auth.uid()::text
            )
        )
    );

-- Users can manage their chat messages
CREATE POLICY "Users can manage own chat" ON chat_messages
    FOR ALL USING (
        user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()::text)
    );

-- =====================================================
-- SERVICE ROLE BYPASS (for backend API)
-- =====================================================
-- The service role key bypasses RLS, allowing the backend
-- to access all data as needed for cross-user operations
-- (e.g., doctors viewing patient records for appointments)

-- =====================================================
-- SAMPLE DATA (Optional - for development)
-- =====================================================

-- Uncomment to insert sample data:
/*
-- Sample doctor specialties for reference
INSERT INTO users (supabase_uid, email, full_name, role) VALUES
    ('sample-doctor-1', 'dr.sharma@medtech.ai', 'Dr. Priya Sharma', 'doctor'),
    ('sample-doctor-2', 'dr.patel@medtech.ai', 'Dr. Rajesh Patel', 'doctor'),
    ('sample-doctor-3', 'dr.kumar@medtech.ai', 'Dr. Anil Kumar', 'doctor');

INSERT INTO doctors (user_id, specialty, qualifications, years_of_experience, consultation_fee, is_available, average_rating)
SELECT 
    id,
    CASE 
        WHEN email = 'dr.sharma@medtech.ai' THEN 'Cardiology'
        WHEN email = 'dr.patel@medtech.ai' THEN 'General Medicine'
        ELSE 'Pediatrics'
    END,
    'MBBS, MD',
    10,
    500.00,
    true,
    4.5
FROM users WHERE role = 'doctor';
*/

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to verify all tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
