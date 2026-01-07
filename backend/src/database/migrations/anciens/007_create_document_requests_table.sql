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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_case FOREIGN KEY (case_id) REFERENCES cases(id),
  CONSTRAINT fk_lawyer FOREIGN KEY (lawyer_id) REFERENCES users(id),
  CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES users(id)
);

CREATE INDEX idx_document_requests_case_id ON document_requests(case_id);
CREATE INDEX idx_document_requests_lawyer_id ON document_requests(lawyer_id);
CREATE INDEX idx_document_requests_client_id ON document_requests(client_id);
CREATE INDEX idx_document_requests_access_token ON document_requests(access_token);
CREATE INDEX idx_document_requests_status ON document_requests(status);
CREATE INDEX idx_document_requests_created_at ON document_requests(created_at DESC);

CREATE OR REPLACE FUNCTION update_document_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_document_requests_updated_at
  BEFORE UPDATE ON document_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_document_requests_updated_at();

COMMENT ON TABLE document_requests IS 'Demandes de documents envoyées par les avocats aux clients';
COMMENT ON COLUMN document_requests.access_token IS 'Token sécurisé pour accéder au formulaire d''upload sans authentification';
COMMENT ON COLUMN document_requests.document_types IS 'Types de documents demandés sous forme de tableau';