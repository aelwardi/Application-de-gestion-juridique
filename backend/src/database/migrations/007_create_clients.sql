CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_city ON clients(city);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE clients
        SET
            total_cases = (
                SELECT COUNT(*)
                FROM cases
                WHERE client_id = NEW.client_id
            ),
            active_cases = (
                SELECT COUNT(*)
                FROM cases
                WHERE client_id = NEW.client_id
                AND status IN ('pending', 'accepted', 'in_progress')
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.client_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE clients
        SET
            total_cases = (
                SELECT COUNT(*)
                FROM cases
                WHERE client_id = OLD.client_id
            ),
            active_cases = (
                SELECT COUNT(*)
                FROM cases
                WHERE client_id = OLD.client_id
                AND status IN ('pending', 'accepted', 'in_progress')
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = OLD.client_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_client_stats ON cases;
CREATE TRIGGER trigger_update_client_stats
AFTER INSERT OR UPDATE OR DELETE ON cases
FOR EACH ROW
EXECUTE FUNCTION update_client_stats();

COMMENT ON TABLE clients IS 'Extended information for client users';
COMMENT ON COLUMN clients.total_cases IS 'Total number of cases for this client';
COMMENT ON COLUMN clients.active_cases IS 'Number of active cases (pending, accepted, in_progress)';