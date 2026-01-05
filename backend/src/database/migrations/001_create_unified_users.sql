-- =====================================================
-- MIGRATION: 001_create_unified_users.sql
-- Description: Table unifiée pour tous les utilisateurs de l'application
-- Types d'utilisateurs: admin, avocat, client, collaborateur
-- =====================================================

-- Création de la table unifiée users
CREATE TABLE IF NOT EXISTS users (
    -- Informations de base (commun à tous les utilisateurs)
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

    -- Champs spécifiques aux AVOCATS
    bar_number VARCHAR(50) UNIQUE, -- Numéro du barreau (obligatoire pour avocats)
    specialties TEXT[] DEFAULT '{}', -- Spécialités de l'avocat
    experience_years INTEGER DEFAULT 0,
    office_address TEXT,
    office_city VARCHAR(100),
    office_postal_code VARCHAR(20),
    latitude DECIMAL(10, 8), -- Coordonnées GPS du cabinet
    longitude DECIMAL(11, 8),
    hourly_rate DECIMAL(10, 2), -- Tarif horaire
    description TEXT, -- Bio/description de l'avocat
    languages TEXT[] DEFAULT '{}', -- Langues parlées
    availability_status VARCHAR(50) DEFAULT 'available' CHECK (
        availability_status IN ('available', 'busy', 'unavailable') OR availability_status IS NULL
    ),
    verified_by_admin BOOLEAN DEFAULT FALSE, -- Vérification par admin
    verified_at TIMESTAMP,
    rating DECIMAL(3, 2) DEFAULT 0.00, -- Note moyenne
    total_reviews INTEGER DEFAULT 0,

    -- Champs spécifiques aux CLIENTS
    address TEXT, -- Adresse du client
    city VARCHAR(100),
    postal_code VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    notes TEXT, -- Notes administratives sur le client

    -- Statistiques (communes clients et avocats)
    total_cases INTEGER DEFAULT 0,
    active_cases INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEX pour optimiser les performances
-- =====================================================

-- Index sur les champs de recherche fréquents
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);

-- Index pour les avocats
CREATE INDEX IF NOT EXISTS idx_users_bar_number ON users(bar_number) WHERE bar_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_office_city ON users(office_city) WHERE role = 'avocat';
CREATE INDEX IF NOT EXISTS idx_users_verified_by_admin ON users(verified_by_admin) WHERE role = 'avocat';
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating DESC) WHERE role = 'avocat';
CREATE INDEX IF NOT EXISTS idx_users_specialties ON users USING GIN(specialties) WHERE role = 'avocat';

-- Index pour les clients
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city) WHERE role = 'client';

-- Index pour recherche géographique des avocats
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude) WHERE role = 'avocat';

-- Index temporel
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);

-- =====================================================
-- CONTRAINTES pour garantir l'intégrité des données
-- =====================================================

-- Contrainte: Un avocat DOIT avoir un bar_number
ALTER TABLE users ADD CONSTRAINT check_lawyer_bar_number
    CHECK (role != 'avocat' OR (role = 'avocat' AND bar_number IS NOT NULL));

-- =====================================================
-- FONCTION pour mise à jour automatique du timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mise à jour automatique de updated_at
DROP TRIGGER IF EXISTS trigger_update_users_timestamp ON users;
CREATE TRIGGER trigger_update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTAIRES pour documentation
-- =====================================================

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

-- =====================================================
-- DONNÉES INITIALES (optionnel)
-- =====================================================

-- Créer un utilisateur admin par défaut (mot de passe: admin123 - À CHANGER EN PRODUCTION!)
-- Hash bcrypt pour 'admin123': $2b$10$rBV2R8T5fGKjKW.8xqF5..8qVx4YZ5nD7hNZO8nQqCXKZ1L0vE7Oi
INSERT INTO users (
    email,
    password_hash,
    role,
    first_name,
    last_name,
    is_active,
    is_verified
) VALUES (
    'admin@juridique.com',
    '$2b$10$rBV2R8T5fGKjKW.8xqF5..8qVx4YZ5nD7hNZO8nQqCXKZ1L0vE7Oi',
    'admin',
    'Admin',
    'Système',
    true,
    true
) ON CONFLICT (email) DO NOTHING;