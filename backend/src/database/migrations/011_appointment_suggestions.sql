-- Table pour les propositions de créneaux
CREATE TABLE IF NOT EXISTS appointment_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  suggested_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggested_to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggested_start_time TIMESTAMP NOT NULL,
  suggested_end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointment_suggestions_by_user ON appointment_suggestions(suggested_by_user_id);
CREATE INDEX idx_appointment_suggestions_to_user ON appointment_suggestions(suggested_to_user_id);
CREATE INDEX idx_appointment_suggestions_appointment ON appointment_suggestions(appointment_id);
CREATE INDEX idx_appointment_suggestions_status ON appointment_suggestions(status);

