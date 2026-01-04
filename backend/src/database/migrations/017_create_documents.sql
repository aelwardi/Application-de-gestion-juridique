-- =====================================================
-- Migration : Création de la table des documents
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- (contract, evidence, court_decision, letter...)
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL, -- En bytes
  file_type VARCHAR(100) NOT NULL, -- MIME type
  file_url VARCHAR(500) NOT NULL, -- URL de stockage (S3/MinIO)
  is_confidential BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES documents(id), -- Pour versioning
  tags TEXT[], -- Tags pour recherche
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_parent_document_id ON documents(parent_document_id);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_is_confidential ON documents(is_confidential);

COMMENT ON TABLE documents IS 'Documents et fichiers liés aux dossiers juridiques';