-- Migration pour ajouter les colonnes de rappels aux appointments
-- Date: 2026-01-05

-- Ajouter les colonnes pour tracker l'envoi des rappels
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_24h_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reminder_2h_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_2h_sent_at TIMESTAMP;

-- Créer un index pour améliorer les performances des queries de rappels
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_24h
ON appointments(start_time, reminder_24h_sent)
WHERE status IN ('scheduled', 'confirmed');

CREATE INDEX IF NOT EXISTS idx_appointments_reminder_2h
ON appointments(start_time, reminder_2h_sent)
WHERE status IN ('scheduled', 'confirmed');

-- Commentaires
COMMENT ON COLUMN appointments.reminder_24h_sent IS 'Indique si le rappel 24h avant a été envoyé';
COMMENT ON COLUMN appointments.reminder_24h_sent_at IS 'Date et heure d''envoi du rappel 24h';
COMMENT ON COLUMN appointments.reminder_2h_sent IS 'Indique si le rappel 2h avant a été envoyé';
COMMENT ON COLUMN appointments.reminder_2h_sent_at IS 'Date et heure d''envoi du rappel 2h';

