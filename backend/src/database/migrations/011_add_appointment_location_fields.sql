-- Migration pour ajouter les colonnes manquantes aux appointments
-- Date: 2026-01-05

-- Ajouter les colonnes de localisation
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS location_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS meeting_url VARCHAR(500);

-- Ajouter des contraintes
ALTER TABLE appointments
ADD CONSTRAINT IF NOT EXISTS chk_location_type
CHECK (location_type IS NULL OR location_type IN ('office', 'court', 'client_location', 'online', 'other'));

-- Créer des index pour les recherches géographiques
CREATE INDEX IF NOT EXISTS idx_appointments_location
ON appointments(location_latitude, location_longitude)
WHERE location_latitude IS NOT NULL AND location_longitude IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN appointments.location_type IS 'Type de lieu du rendez-vous';
COMMENT ON COLUMN appointments.location_address IS 'Adresse complète du rendez-vous';
COMMENT ON COLUMN appointments.location_latitude IS 'Latitude pour géolocalisation';
COMMENT ON COLUMN appointments.location_longitude IS 'Longitude pour géolocalisation';
COMMENT ON COLUMN appointments.meeting_url IS 'URL pour rendez-vous en ligne';

