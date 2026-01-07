ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS location_type VARCHAR(50) CHECK (location_type IN ('office', 'court', 'client_location', 'online', 'other')),
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS meeting_url VARCHAR(500);

CREATE INDEX IF NOT EXISTS idx_appointments_location_type ON appointments(location_type) WHERE location_type IS NOT NULL;

COMMENT ON COLUMN appointments.location_type IS 'Type de lieu du rendez-vous (office, court, client_location, online, other)';
COMMENT ON COLUMN appointments.location_address IS 'Adresse complète du rendez-vous';
COMMENT ON COLUMN appointments.location_latitude IS 'Latitude GPS du lieu';
COMMENT ON COLUMN appointments.location_longitude IS 'Longitude GPS du lieu';
COMMENT ON COLUMN appointments.meeting_url IS 'URL de la réunion en ligne (Zoom, Teams, etc.)';
