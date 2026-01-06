CREATE TABLE IF NOT EXISTS case_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    case_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_case_offers_client_id ON case_offers(client_id);
CREATE INDEX IF NOT EXISTS idx_case_offers_lawyer_id ON case_offers(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_case_offers_status ON case_offers(status);
CREATE INDEX IF NOT EXISTS idx_case_offers_created_at ON case_offers(created_at DESC);

COMMENT ON TABLE case_offers IS 'Offres de litiges soumises par les clients aux avocats';