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
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    two_factor_backup_codes TEXT[],
    two_factor_verified_at TIMESTAMP,
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
CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users(two_factor_enabled) WHERE two_factor_enabled = true;

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_lawyer_bar_number;
ALTER TABLE users ADD CONSTRAINT check_lawyer_bar_number
    CHECK (role != 'avocat' OR (role = 'avocat' AND bar_number IS NOT NULL));

COMMENT ON TABLE users IS 'Table unifiée pour tous les utilisateurs: admin, avocat, client, collaborateur';
COMMENT ON COLUMN users.role IS 'Type utilisateur: admin, avocat, client, collaborateur';
COMMENT ON COLUMN users.bar_number IS 'Numéro du barreau (obligatoire et unique pour les avocats)';
COMMENT ON COLUMN users.specialties IS 'Tableau des spécialités juridiques (avocats uniquement)';
COMMENT ON COLUMN users.languages IS 'Langues parlées par l''avocat';
COMMENT ON COLUMN users.total_cases IS 'Nombre total de dossiers (clients et avocats)';
COMMENT ON COLUMN users.active_cases IS 'Nombre de dossiers actifs (clients et avocats)';
COMMENT ON COLUMN users.address IS 'Adresse personnelle (clients)';
COMMENT ON COLUMN users.office_address IS 'Adresse du cabinet (avocats)';
COMMENT ON COLUMN users.verified_by_admin IS 'Statut de vérification par un administrateur (avocats)';
COMMENT ON COLUMN users.two_factor_enabled IS 'Indique si l''authentification à deux facteurs est activée';
COMMENT ON COLUMN users.two_factor_secret IS 'Secret TOTP pour la génération des codes 2FA';
COMMENT ON COLUMN users.two_factor_backup_codes IS 'Codes de secours pour accès d''urgence';
COMMENT ON COLUMN users.two_factor_verified_at IS 'Date de vérification initiale du 2FA';

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

CREATE TABLE IF NOT EXISTS two_factor_temp_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    temp_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT false,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_2fa_temp_tokens_user_id ON two_factor_temp_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_2fa_temp_tokens_token ON two_factor_temp_tokens(temp_token);
CREATE INDEX IF NOT EXISTS idx_2fa_temp_tokens_expires_at ON two_factor_temp_tokens(expires_at);

COMMENT ON TABLE two_factor_temp_tokens IS 'Tokens temporaires pour le processus de connexion avec 2FA';
COMMENT ON COLUMN two_factor_temp_tokens.temp_token IS 'Token temporaire utilisé pendant le processus de connexion 2FA';
COMMENT ON COLUMN two_factor_temp_tokens.verified IS 'Indique si le code 2FA a été vérifié avec succès';

CREATE TABLE IF NOT EXISTS activity_logs (
                                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    ip_address VARCHAR(50),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON activity_logs(entity_id);

COMMENT ON TABLE activity_logs IS 'Audit trail for administrative actions and system events';
COMMENT ON COLUMN activity_logs.action IS 'Type of action performed (e.g., USER_CREATED, USER_DELETED, USER_VERIFIED)';
COMMENT ON COLUMN activity_logs.entity_type IS 'Type of entity affected (e.g., user, case, appointment)';
COMMENT ON COLUMN activity_logs.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN activity_logs.metadata IS 'Additional contextual data in JSON format';

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

CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at DESC);

COMMENT ON TABLE support_tickets IS 'Tickets de support et assistance';
COMMENT ON TABLE support_messages IS 'Messages dans les tickets de support';
COMMENT ON COLUMN support_messages.is_internal IS 'Notes internes visibles uniquement par les admins';

CREATE TABLE IF NOT EXISTS lawyer_specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

INSERT INTO lawyer_specialties (name, description, icon) VALUES
    ('Droit pénal', 'Défense pénale, crimes, délits', ''),
    ('Droit civil', 'Litiges civils, contrats, responsabilité', ''),
    ('Droit de la famille', 'Divorce, garde enfants, succession', ''),
    ('Droit du travail', 'Conflits employeur-employé, licenciements', ''),
    ('Droit commercial', 'Entreprises, sociétés, commerce', ''),
    ('Droit immobilier', 'Transactions, litiges immobiliers', ''),
    ('Droit fiscal', 'Fiscalité, impôts, contrôles', ''),
    ('Droit administratif', 'Relations avec administration', ''),
    ('Droit international', 'Transactions internationales', ''),
    ('Propriété intellectuelle', 'Brevets, marques, droits auteur', '')
    ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE lawyer_specialties IS 'Liste des spécialités juridiques disponibles';

CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(100) UNIQUE NOT NULL,
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
    court_reference VARCHAR(100),
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
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
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);

COMMENT ON TABLE cases IS 'Dossiers juridiques gérés par les avocats pour les clients';
COMMENT ON COLUMN cases.case_type IS 'Type de dossier (civil, pénal, commercial, familial, etc.)';
COMMENT ON COLUMN cases.opening_date IS 'Date d''ouverture du dossier';
COMMENT ON COLUMN cases.closing_date IS 'Date de clôture du dossier';
COMMENT ON COLUMN cases.court_name IS 'Nom du tribunal';
COMMENT ON COLUMN cases.judge_name IS 'Nom du juge';
COMMENT ON COLUMN cases.status IS 'Statut du dossier: pending, in_progress, on_hold, closed, archived';

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
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_is_confidential ON documents(is_confidential);
CREATE INDEX IF NOT EXISTS idx_documents_parent_document_id ON documents(parent_document_id);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

COMMENT ON TABLE documents IS 'Documents et fichiers liés aux dossiers juridiques';

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
COMMENT ON COLUMN document_requests.access_token IS 'Token sécurisé pour accéder au formulaire d''upload sans authentification';
COMMENT ON COLUMN document_requests.document_types IS 'Types de documents demandés sous forme de tableau';

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
    location_type VARCHAR(50) CHECK (location_type IN ('office', 'court', 'client_location', 'online', 'other')),
    location_address TEXT,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    meeting_url VARCHAR(500),
    appointment_type VARCHAR(100) DEFAULT 'consultation',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50),
    recurrence_end_date DATE,
    parent_appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    series_id UUID,
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMP,
    reminder_24h_sent BOOLEAN DEFAULT FALSE,
    reminder_24h_sent_at TIMESTAMP,
    reminder_2h_sent BOOLEAN DEFAULT FALSE,
    reminder_2h_sent_at TIMESTAMP,
    notes TEXT,
    private_notes TEXT,
    shared_notes TEXT,
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
CREATE INDEX IF NOT EXISTS idx_appointments_series_id ON appointments(series_id) WHERE series_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_location_type ON appointments(location_type) WHERE location_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_24h ON appointments(start_date, reminder_24h_sent) WHERE status IN ('pending', 'confirmed');
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_2h ON appointments(start_date, reminder_2h_sent) WHERE status IN ('pending', 'confirmed');

COMMENT ON TABLE appointments IS 'Rendez-vous entre avocats et clients';
COMMENT ON COLUMN appointments.location_type IS 'Type de lieu du rendez-vous (office, court, client_location, online, other)';
COMMENT ON COLUMN appointments.location_address IS 'Adresse complète du rendez-vous';
COMMENT ON COLUMN appointments.location_latitude IS 'Latitude GPS du lieu';
COMMENT ON COLUMN appointments.location_longitude IS 'Longitude GPS du lieu';
COMMENT ON COLUMN appointments.meeting_url IS 'URL de la réunion en ligne (Zoom, Teams, etc.)';
COMMENT ON COLUMN appointments.private_notes IS 'Notes privées visibles uniquement par l''avocat';
COMMENT ON COLUMN appointments.shared_notes IS 'Notes partagées visibles par le client';
COMMENT ON COLUMN appointments.series_id IS 'ID de la série si le rendez-vous fait partie d''une récurrence';
COMMENT ON COLUMN appointments.reminder_24h_sent IS 'Indique si le rappel 24h avant a été envoyé';
COMMENT ON COLUMN appointments.reminder_2h_sent IS 'Indique si le rappel 2h avant a été envoyé';

CREATE TABLE IF NOT EXISTS appointment_series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    interval INTEGER NOT NULL DEFAULT 1,
    days_of_week INTEGER[],
    end_date DATE,
    occurrences INTEGER,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

COMMENT ON TABLE appointment_series IS 'Séries de rendez-vous récurrents';

CREATE TABLE IF NOT EXISTS appointment_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS appointment_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_appointment_documents_appointment_id ON appointment_documents(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_documents_uploaded_by ON appointment_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_appointment_documents_document_type ON appointment_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_appointment_documents_is_private ON appointment_documents(is_private);
CREATE INDEX IF NOT EXISTS idx_appointment_documents_created_at ON appointment_documents(created_at DESC);

COMMENT ON TABLE appointment_documents IS 'Documents et notes liés aux rendez-vous';
COMMENT ON COLUMN appointment_documents.is_private IS 'True si document visible uniquement par l''avocat';
COMMENT ON COLUMN appointment_documents.document_type IS 'Type de document (agenda, notes, contract, evidence, report, other)';

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

CREATE INDEX IF NOT EXISTS idx_reviews_lawyer_id ON reviews(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_published ON reviews(is_published);

COMMENT ON TABLE reviews IS 'Avis et évaluations des clients sur les avocats';

CREATE TABLE IF NOT EXISTS client_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    case_category VARCHAR(100),
    urgency VARCHAR(50) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    preferred_date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    lawyer_response TEXT,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_client_requests_client_id ON client_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_lawyer_id ON client_requests(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON client_requests(status);
CREATE INDEX IF NOT EXISTS idx_client_requests_urgency ON client_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_client_requests_created_at ON client_requests(created_at DESC);

COMMENT ON TABLE client_requests IS 'Demandes envoyées par les clients aux avocats';

CREATE TABLE IF NOT EXISTS client_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('general', 'important', 'warning', 'reminder', 'meeting')),
    title VARCHAR(255),
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT TRUE,
    remind_at TIMESTAMP,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_created_by ON client_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_client_notes_note_type ON client_notes(note_type);

COMMENT ON TABLE client_notes IS 'Notes privées concernant les clients (pour avocats)';

CREATE TABLE IF NOT EXISTS client_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('consultation', 'retainer', 'hourly', 'fixed', 'expense', 'other')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'check', 'card', 'transfer', 'online')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'overdue', 'cancelled', 'refunded')),
    due_date DATE,
    paid_date DATE,
    invoice_number VARCHAR(100),
    description TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_client_payments_client_id ON client_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_case_id ON client_payments(case_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_status ON client_payments(status);
CREATE INDEX IF NOT EXISTS idx_client_payments_due_date ON client_payments(due_date);

COMMENT ON TABLE client_payments IS 'Suivi des paiements des clients';

CREATE TABLE IF NOT EXISTS client_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('email', 'phone', 'meeting', 'sms', 'video_call', 'other')),
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
    subject VARCHAR(255),
    summary TEXT,
    duration_minutes INTEGER,
    outcome TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_client_communications_client_id ON client_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_case_id ON client_communications(case_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_created_at ON client_communications(created_at DESC);

COMMENT ON TABLE client_communications IS 'Historique des communications avec les clients';

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

CREATE TABLE IF NOT EXISTS lawyer_requests (
                                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    case_type VARCHAR(100) NOT NULL,
    urgency VARCHAR(50) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    preferred_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_lawyer_requests_client_id ON lawyer_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_requests_lawyer_id ON lawyer_requests(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_requests_status ON lawyer_requests(status);
CREATE INDEX IF NOT EXISTS idx_lawyer_requests_created_at ON lawyer_requests(created_at DESC);

COMMENT ON TABLE lawyer_requests IS 'Demandes des clients vers des avocats spécifiques';

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_different_participants CHECK (participant1_id != participant2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_case_id ON conversations(case_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS unique_general_conversation
ON conversations (LEAST(participant1_id, participant2_id), GREATEST(participant1_id, participant2_id))
WHERE case_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_case_conversation
ON conversations (LEAST(participant1_id, participant2_id), GREATEST(participant1_id, participant2_id), case_id)
WHERE case_id IS NOT NULL;

COMMENT ON TABLE conversations IS 'Conversations entre utilisateurs (générales ou liées à un dossier)';

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

CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    category VARCHAR(100),
    comment TEXT,
    suggestions TEXT,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'replied', 'archived')),
    admin_response TEXT,
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_user_role ON feedback(user_role);
CREATE INDEX IF NOT EXISTS idx_feedback_admin_id ON feedback(admin_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

COMMENT ON TABLE feedback IS 'Feedbacks et avis des utilisateurs sur l''application';

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
  AND tablename IN (
                    'users', 'support_tickets', 'cases', 'appointments', 'documents',
                    'document_requests', 'client_requests', 'case_offers', 'client_notes',
                    'client_payments', 'appointment_documents', 'lawyer_requests', 'feedback'
    )
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

INSERT INTO migrations (name) VALUES
    ('init-db')
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
             '$2b$10$rBV2R8T5fGKjKW.8xqF5...',
             'admin',
             'Admin',
             'Système',
             true,
             true
         ) ON CONFLICT (email) DO NOTHING;

COMMENT ON DATABASE postgres IS 'Base de données Application de Gestion Juridique - Version consolidée 2026-01-08';