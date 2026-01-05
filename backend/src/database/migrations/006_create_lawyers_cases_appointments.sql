-- =====================================================
-- Note: La table 'lawyers' a été fusionnée dans la table 'users'
-- Les avocats sont maintenant identifiés par role='avocat' dans users
-- =====================================================

CREATE TABLE IF NOT EXISTS lawyer_specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO lawyer_specialties (name, description, icon) VALUES
('Droit pénal', 'Défense pénale, crimes, délits', '⚖️'),
('Droit civil', 'Litiges civils, contrats, responsabilité', '📄'),
('Droit de la famille', 'Divorce, garde enfants, succession', '👨‍👩‍👧'),
('Droit du travail', 'Conflits employeur-employé, licenciements', '💼'),
('Droit commercial', 'Entreprises, sociétés, commerce', '🏢'),
('Droit immobilier', 'Transactions, litiges immobiliers', '🏠'),
('Droit fiscal', 'Fiscalité, impôts, contrôles', '💰'),
('Droit administratif', 'Relations avec administration', '🏛️'),
('Droit international', 'Transactions internationales', '🌍'),
('Propriété intellectuelle', 'Brevets, marques, droits auteur', '©️')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'on_hold', 'resolved', 'closed', 'rejected')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    court_reference VARCHAR(100),
    next_hearing_date TIMESTAMP,
    estimated_duration_months INTEGER,
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS case_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    description TEXT,
    is_confidential BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_type VARCHAR(50) NOT NULL CHECK (appointment_type IN ('consultation', 'court', 'meeting', 'phone', 'video')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location TEXT,
    location_type VARCHAR(50) CHECK (location_type IN ('office', 'court', 'client_location', 'online', 'other')),
    location_address TEXT,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    meeting_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_24h_sent BOOLEAN DEFAULT FALSE,
    reminder_24h_sent_at TIMESTAMP,
    reminder_2h_sent BOOLEAN DEFAULT FALSE,
    reminder_2h_sent_at TIMESTAMP,
    notes TEXT,
    private_notes TEXT,
    shared_notes TEXT,
    series_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    moderated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEX pour optimiser les performances
-- =====================================================

-- Note: Les index pour les avocats sont maintenant dans 001_create_unified_users.sql

CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_lawyer_id ON appointments(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_location ON appointments(location_latitude, location_longitude) WHERE location_latitude IS NOT NULL AND location_longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_location_type ON appointments(location_type) WHERE location_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_series_id ON appointments(series_id) WHERE series_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_24h ON appointments(start_time, reminder_24h_sent) WHERE status IN ('scheduled', 'confirmed');
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_2h ON appointments(start_time, reminder_2h_sent) WHERE status IN ('scheduled', 'confirmed');
CREATE INDEX IF NOT EXISTS idx_reviews_lawyer_id ON reviews(lawyer_id);

-- =====================================================
-- COMMENTAIRES pour documentation
-- =====================================================

COMMENT ON TABLE cases IS 'Legal cases managed by lawyers for clients';
COMMENT ON TABLE appointments IS 'Scheduled appointments between lawyers and clients';
COMMENT ON TABLE reviews IS 'Client reviews for lawyers';

-- Commentaires sur les colonnes de localisation
COMMENT ON COLUMN appointments.location_type IS 'Type de lieu du rendez-vous (office, court, client_location, online, other)';
COMMENT ON COLUMN appointments.location_address IS 'Adresse complète du rendez-vous';
COMMENT ON COLUMN appointments.location_latitude IS 'Latitude pour géolocalisation';
COMMENT ON COLUMN appointments.location_longitude IS 'Longitude pour géolocalisation';
COMMENT ON COLUMN appointments.meeting_url IS 'URL pour rendez-vous en ligne (Zoom, Teams, Google Meet, etc.)';
COMMENT ON COLUMN appointments.private_notes IS 'Notes privées visibles uniquement par l''avocat';
COMMENT ON COLUMN appointments.shared_notes IS 'Notes partagées visibles par le client';
COMMENT ON COLUMN appointments.series_id IS 'ID de la série si le rendez-vous fait partie d''une récurrence';
COMMENT ON COLUMN appointments.reminder_24h_sent IS 'Indique si le rappel 24h avant a été envoyé';
COMMENT ON COLUMN appointments.reminder_2h_sent IS 'Indique si le rappel 2h avant a été envoyé';