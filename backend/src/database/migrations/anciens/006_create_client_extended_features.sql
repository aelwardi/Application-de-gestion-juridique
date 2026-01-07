CREATE TABLE IF NOT EXISTS client_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('consultation', 'new_case', 'second_opinion', 'urgent')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    case_category VARCHAR(100),
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    preferred_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'rejected', 'cancelled', 'completed')),
    lawyer_response TEXT,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE INDEX IF NOT EXISTS idx_client_requests_client_id ON client_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_lawyer_id ON client_requests(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON client_requests(status);
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_created_by ON client_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_client_payments_client_id ON client_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_case_id ON client_payments(case_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_status ON client_payments(status);
CREATE INDEX IF NOT EXISTS idx_client_communications_client_id ON client_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_case_id ON client_communications(case_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_created_at ON client_communications(created_at DESC);

CREATE OR REPLACE FUNCTION update_client_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_client_requests_updated_at
    BEFORE UPDATE ON client_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_client_requests_updated_at();

CREATE TRIGGER trigger_client_notes_updated_at
    BEFORE UPDATE ON client_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_client_requests_updated_at();

CREATE TRIGGER trigger_client_payments_updated_at
    BEFORE UPDATE ON client_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_client_requests_updated_at();

COMMENT ON TABLE client_requests IS 'Requests from clients to lawyers for legal services';
COMMENT ON TABLE client_notes IS 'Private notes about clients for lawyers';
COMMENT ON TABLE client_payments IS 'Payment tracking for client services';
COMMENT ON TABLE client_communications IS 'Communication history with clients';