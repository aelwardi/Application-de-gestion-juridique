-- =====================================================
-- Migration : Ajout des colonnes de localisation complètes
-- Date: 2026-01-05
-- =====================================================

-- Vérifier et ajouter toutes les colonnes de localisation manquantes
DO $$
BEGIN
    -- location_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'appointments' AND column_name = 'location_type'
    ) THEN
        ALTER TABLE appointments ADD COLUMN location_type VARCHAR(50);
        RAISE NOTICE 'Colonne location_type ajoutée';
    END IF;

    -- location_address
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'appointments' AND column_name = 'location_address'
    ) THEN
        ALTER TABLE appointments ADD COLUMN location_address TEXT;
        RAISE NOTICE 'Colonne location_address ajoutée';
    END IF;

    -- location_latitude
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'appointments' AND column_name = 'location_latitude'
    ) THEN
        ALTER TABLE appointments ADD COLUMN location_latitude DECIMAL(10, 8);
        RAISE NOTICE 'Colonne location_latitude ajoutée';
    END IF;

    -- location_longitude
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'appointments' AND column_name = 'location_longitude'
    ) THEN
        ALTER TABLE appointments ADD COLUMN location_longitude DECIMAL(11, 8);
        RAISE NOTICE 'Colonne location_longitude ajoutée';
    END IF;

    -- meeting_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'appointments' AND column_name = 'meeting_url'
    ) THEN
        ALTER TABLE appointments ADD COLUMN meeting_url VARCHAR(500);
        RAISE NOTICE 'Colonne meeting_url ajoutée';
    END IF;

    -- private_notes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'appointments' AND column_name = 'private_notes'
    ) THEN
        ALTER TABLE appointments ADD COLUMN private_notes TEXT;
        RAISE NOTICE 'Colonne private_notes ajoutée';
    END IF;

    -- shared_notes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'appointments' AND column_name = 'shared_notes'
    ) THEN
        ALTER TABLE appointments ADD COLUMN shared_notes TEXT;
        RAISE NOTICE 'Colonne shared_notes ajoutée';
    END IF;
END $$;

-- Ajouter les contraintes si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_location_type'
    ) THEN
        ALTER TABLE appointments
        ADD CONSTRAINT chk_location_type
        CHECK (location_type IS NULL OR location_type IN ('office', 'court', 'client_location', 'online', 'other'));
        RAISE NOTICE 'Contrainte chk_location_type ajoutée';
    END IF;
END $$;

-- Créer les index pour les recherches géographiques
CREATE INDEX IF NOT EXISTS idx_appointments_location
ON appointments(location_latitude, location_longitude)
WHERE location_latitude IS NOT NULL AND location_longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_location_type
ON appointments(location_type)
WHERE location_type IS NOT NULL;

-- Commentaires sur les colonnes
COMMENT ON COLUMN appointments.location_type IS 'Type de lieu du rendez-vous (office, court, client_location, online, other)';
COMMENT ON COLUMN appointments.location_address IS 'Adresse complète du rendez-vous';
COMMENT ON COLUMN appointments.location_latitude IS 'Latitude pour géolocalisation';
COMMENT ON COLUMN appointments.location_longitude IS 'Longitude pour géolocalisation';
COMMENT ON COLUMN appointments.meeting_url IS 'URL pour rendez-vous en ligne (Zoom, Teams, etc.)';
COMMENT ON COLUMN appointments.private_notes IS 'Notes privées visibles uniquement par l''avocat';
COMMENT ON COLUMN appointments.shared_notes IS 'Notes partagées visibles par le client';

-- Afficher un résumé
DO $$
DECLARE
    location_cols INTEGER;
BEGIN
    SELECT COUNT(*) INTO location_cols
    FROM information_schema.columns
    WHERE table_name = 'appointments'
    AND column_name IN ('location_type', 'location_address', 'location_latitude', 'location_longitude', 'meeting_url', 'private_notes', 'shared_notes');

    RAISE NOTICE '✅ Migration terminée: % colonnes de localisation présentes', location_cols;
END $$;

