-- =====================================================
-- Migration : Création de la table des messages
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system', 'notification')),
  attachments JSONB, -- {files: [{name, url, type, size}]}
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON messages(is_deleted) WHERE is_deleted = false;

COMMENT ON TABLE messages IS 'Messages échangés dans les conversations';
