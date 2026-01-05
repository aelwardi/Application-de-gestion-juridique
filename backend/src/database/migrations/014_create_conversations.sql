-- =====================================================
-- Migration : Création de la table des conversations
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  conversation_type VARCHAR(50) DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group', 'case')),
  title VARCHAR(255),
  participants UUID[] NOT NULL, -- Array des user_ids participants
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_conversations_case_id ON conversations(case_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(conversation_type);

COMMENT ON TABLE conversations IS 'Conversations entre utilisateurs (direct, groupe ou liées à un dossier)';
