-- =====================================================
-- Migration : Création de la table des demandes vers les avocats
-- =====================================================
CREATE TABLE IF NOT EXISTS lawyer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Référence vers users (avocats)
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