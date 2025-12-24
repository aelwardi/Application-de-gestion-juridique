-- Migration: Create appointments table
-- Description: Table pour gérer les rendez-vous entre avocats et clients

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location_type VARCHAR(50) CHECK (location_type IN ('office', 'court', 'client_location', 'online', 'other')),
  location_address TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  meeting_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_appointments_lawyer_id ON appointments(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_case_id ON appointments(case_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at_trigger
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_appointments_updated_at();

-- Commentaires
COMMENT ON TABLE appointments IS 'Table des rendez-vous entre avocats et clients';
COMMENT ON COLUMN appointments.appointment_type IS 'Type: consultation, tribunal, rencontre_client, expertise, mediation, signature, autre';
COMMENT ON COLUMN appointments.location_type IS 'Type de lieu: office, court, client_location, online, other';
COMMENT ON COLUMN appointments.status IS 'Statut: scheduled, confirmed, cancelled, completed, no_show';
