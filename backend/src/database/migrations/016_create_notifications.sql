CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(100) NOT NULL, -- (appointment_reminder, document_uploaded, message_received, case_update...)
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Données additionnelles (case_id, appointment_id, etc.)
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);