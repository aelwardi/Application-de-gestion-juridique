-- Migration : Création de la table des offres (litiges clients)
CREATE TABLE IF NOT EXISTS case_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    case_type VARCHAR(100) NOT NULL, -- Type de dossier (civil, pénal...)
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour accélérer les recherches par avocat
CREATE INDEX idx_case_offers_lawyer_id ON case_offers(lawyer_id);