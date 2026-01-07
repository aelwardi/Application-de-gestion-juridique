CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'avocat', 'client', 'collaborateur')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_picture_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    bar_number VARCHAR(50) UNIQUE,
    specialties TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    office_address TEXT,
    office_city VARCHAR(100),
    office_postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    hourly_rate DECIMAL(10, 2),
    description TEXT,
    languages TEXT[] DEFAULT '{}',
    availability_status VARCHAR(50) DEFAULT 'available' CHECK (
        availability_status IN ('available', 'busy', 'unavailable') OR availability_status IS NULL
    ),
    verified_by_admin BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    notes TEXT,
    total_cases INTEGER DEFAULT 0,
    active_cases INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_bar_number ON users(bar_number) WHERE bar_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_office_city ON users(office_city) WHERE role = 'avocat';
CREATE INDEX IF NOT EXISTS idx_users_verified_by_admin ON users(verified_by_admin) WHERE role = 'avocat';
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating DESC) WHERE role = 'avocat';
CREATE INDEX IF NOT EXISTS idx_users_specialties ON users USING GIN(specialties) WHERE role = 'avocat';
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city) WHERE role = 'client';
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude) WHERE role = 'avocat';
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_lawyer_bar_number;
ALTER TABLE users ADD CONSTRAINT check_lawyer_bar_number
    CHECK (role != 'avocat' OR (role = 'avocat' AND bar_number IS NOT NULL));

COMMENT ON TABLE users IS 'Table unifiée pour tous les utilisateurs: admin, avocat, client, collaborateur';

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

COMMENT ON TABLE password_reset_tokens IS 'Tokens de réinitialisation de mot de passe';

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

COMMENT ON TABLE activity_logs IS 'Journaux d''activité des utilisateurs';

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(100),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

COMMENT ON TABLE support_tickets IS 'Tickets de support et assistance';

CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    case_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'on_hold', 'closed', 'archived')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    opening_date DATE DEFAULT CURRENT_DATE,
    closing_date DATE,
    next_hearing_date TIMESTAMP,
    estimated_duration_months INTEGER,
    court_name VARCHAR(255),
    judge_name VARCHAR(255),
    opposing_party VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_case_type ON cases(case_type);
CREATE INDEX IF NOT EXISTS idx_cases_opening_date ON cases(opening_date DESC);
CREATE INDEX IF NOT EXISTS idx_cases_next_hearing_date ON cases(next_hearing_date) WHERE next_hearing_date IS NOT NULL;

COMMENT ON TABLE cases IS 'Dossiers juridiques gérés par les avocats pour les clients';

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    appointment_type VARCHAR(100) DEFAULT 'consultation',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50),
    recurrence_end_date DATE,
    parent_appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_start_before_end CHECK (start_date < end_date)
);

CREATE INDEX IF NOT EXISTS idx_appointments_lawyer_id ON appointments(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_case_id ON appointments(case_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_date ON appointments(start_date);
CREATE INDEX IF NOT EXISTS idx_appointments_end_date ON appointments(end_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_is_recurring ON appointments(is_recurring);
CREATE INDEX IF NOT EXISTS idx_appointments_parent_id ON appointments(parent_appointment_id);

COMMENT ON TABLE appointments IS 'Rendez-vous entre avocats et clients';

CREATE TABLE IF NOT EXISTS appointment_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    suggested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suggested_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suggested_start_date TIMESTAMP NOT NULL,
    suggested_end_date TIMESTAMP NOT NULL,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_suggested_dates CHECK (suggested_start_date < suggested_end_date)
);

CREATE INDEX IF NOT EXISTS idx_appointment_suggestions_appointment_id ON appointment_suggestions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_suggestions_suggested_by ON appointment_suggestions(suggested_by);
CREATE INDEX IF NOT EXISTS idx_appointment_suggestions_suggested_to ON appointment_suggestions(suggested_to);
CREATE INDEX IF NOT EXISTS idx_appointment_suggestions_status ON appointment_suggestions(status);

COMMENT ON TABLE appointment_suggestions IS 'Propositions de créneaux de rendez-vous';

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(100) DEFAULT 'other',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    file_url VARCHAR(500) NOT NULL,
    is_confidential BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_is_confidential ON documents(is_confidential);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

COMMENT ON TABLE documents IS 'Documents liés aux dossiers juridiques';

CREATE TABLE IF NOT EXISTS document_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    document_types TEXT[],
    access_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
    uploaded_documents_count INTEGER DEFAULT 0,
    last_upload_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_document_requests_case_id ON document_requests(case_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_lawyer_id ON document_requests(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_client_id ON document_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_access_token ON document_requests(access_token);
CREATE INDEX IF NOT EXISTS idx_document_requests_status ON document_requests(status);
CREATE INDEX IF NOT EXISTS idx_document_requests_created_at ON document_requests(created_at DESC);

COMMENT ON TABLE document_requests IS 'Demandes de documents envoyées par les avocats aux clients';

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_different_participants CHECK (participant1_id != participant2_id),
    CONSTRAINT unique_conversation UNIQUE (participant1_id, participant2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_case_id ON conversations(case_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

COMMENT ON TABLE conversations IS 'Conversations entre utilisateurs';

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

COMMENT ON TABLE messages IS 'Messages échangés entre utilisateurs';

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

COMMENT ON TABLE notifications IS 'Notifications système pour les utilisateurs';

CREATE TABLE IF NOT EXISTS client_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    case_category VARCHAR(100),
    urgency VARCHAR(50) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    preferred_date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_client_requests_client_id ON client_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_lawyer_id ON client_requests(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON client_requests(status);
CREATE INDEX IF NOT EXISTS idx_client_requests_urgency ON client_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_client_requests_created_at ON client_requests(created_at DESC);

COMMENT ON TABLE client_requests IS 'Demandes envoyées par les clients aux avocats';

CREATE TABLE IF NOT EXISTS case_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_title VARCHAR(255) NOT NULL,
    case_description TEXT NOT NULL,
    case_type VARCHAR(100) NOT NULL,
    urgency VARCHAR(50) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    budget_range VARCHAR(100),
    location VARCHAR(255),
    preferred_specialties TEXT[],
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'closed', 'cancelled')),
    assigned_lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_case_offers_client_id ON case_offers(client_id);
CREATE INDEX IF NOT EXISTS idx_case_offers_assigned_lawyer_id ON case_offers(assigned_lawyer_id);
CREATE INDEX IF NOT EXISTS idx_case_offers_status ON case_offers(status);
CREATE INDEX IF NOT EXISTS idx_case_offers_urgency ON case_offers(urgency);
CREATE INDEX IF NOT EXISTS idx_case_offers_case_type ON case_offers(case_type);
CREATE INDEX IF NOT EXISTS idx_case_offers_created_at ON case_offers(created_at DESC);

COMMENT ON TABLE case_offers IS 'Offres de dossiers publiées par les clients';

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN ('users', 'support_tickets', 'cases', 'appointments', 'documents', 'document_requests', 'client_requests', 'case_offers')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_update_%I_timestamp ON %I', table_name, table_name);
        EXECUTE format('CREATE TRIGGER trigger_update_%I_timestamp BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', table_name, table_name);
    END LOOP;
END;
$$;

CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO migrations (name) VALUES ('init-db')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (
    email,
    password_hash,
    role,
    first_name,
    last_name,
    is_active,
    is_verified
) VALUES (
    'a.elwardi@myskolae.fr',
    '$2b$10$rBV2R8T5fGKjKW.8xqF5..8qVx4YZ5nD7hNZO8nQqCXKZ1L0vE7Oi',
    'admin',
    'Admin',
    'Système',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

COMMENT ON DATABASE CURRENT_DATABASE() IS 'Base de données Application de Gestion Juridique - Version 2026-01-07';