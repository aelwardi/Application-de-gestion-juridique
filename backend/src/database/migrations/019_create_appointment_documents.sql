-- =====================================================
-- Migration : Création de la table appointment_documents
-- Date: 2026-01-05
-- =====================================================

-- Table pour les documents liés aux rendez-vous
CREATE TABLE IF NOT EXISTS appointment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- (agenda, notes, contract, evidence, report...)
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL, -- En bytes
  file_type VARCHAR(100) NOT NULL, -- MIME type
  file_url VARCHAR(500) NOT NULL, -- URL de stockage
  is_private BOOLEAN DEFAULT false, -- Notes privées de l'avocat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_appointment_documents_appointment_id ON appointment_documents(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_documents_uploaded_by ON appointment_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_appointment_documents_document_type ON appointment_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_appointment_documents_is_private ON appointment_documents(is_private);
CREATE INDEX IF NOT EXISTS idx_appointment_documents_created_at ON appointment_documents(created_at DESC);

-- Commentaires
COMMENT ON TABLE appointment_documents IS 'Documents et notes liés aux rendez-vous';
COMMENT ON COLUMN appointment_documents.is_private IS 'True si document visible uniquement par l''avocat';
COMMENT ON COLUMN appointment_documents.document_type IS 'Type de document (agenda, notes, contract, evidence, report, other)';

-- Ajouter une colonne notes aux appointments pour les notes rapides
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS private_notes TEXT, -- Notes privées de l'avocat
ADD COLUMN IF NOT EXISTS shared_notes TEXT;  -- Notes visibles par le client

COMMENT ON COLUMN appointments.private_notes IS 'Notes privées visibles uniquement par l''avocat';
COMMENT ON COLUMN appointments.shared_notes IS 'Notes partagées visibles par le client';