-- Migration: Corriger les foreign keys de la table appointments
-- Les rendez-vous doivent être entre un lawyer (lawyers.id) et un client (clients.id), pas des users

-- 1. Supprimer les anciennes contraintes
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_lawyer_id_fkey;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_client_id_fkey;

-- 2. Ajouter les nouvelles contraintes avec les bonnes références
ALTER TABLE appointments 
ADD CONSTRAINT appointments_lawyer_id_fkey 
FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE;

ALTER TABLE appointments 
ADD CONSTRAINT appointments_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- 3. Ajouter les colonnes manquantes selon le schéma du README
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_type VARCHAR(50) CHECK (location_type IN ('office', 'court', 'client_location', 'online', 'other'));
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_address TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_url VARCHAR(500);

-- 4. Modifier appointment_type pour accepter plus de valeurs
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_appointment_type_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_appointment_type_check 
CHECK (appointment_type IN ('consultation', 'tribunal', 'rencontre_client', 'expertise', 'mediation', 'signature', 'court', 'meeting', 'phone', 'video', 'autre'));

COMMENT ON TABLE appointments IS 'Scheduled appointments between lawyers (lawyers.id) and clients (clients.id)';
