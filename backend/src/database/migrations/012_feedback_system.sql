-- Migration: Système de feedback/avis
-- Description: Création de la table feedback pour gérer les avis des utilisateurs

-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table feedback
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  category VARCHAR(50),
  comment TEXT,
  suggestions TEXT,
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'replied', 'archived')),
  admin_response TEXT,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Fonction pour notifier l'utilisateur d'une réponse
CREATE OR REPLACE FUNCTION notify_feedback_response()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.admin_response IS NOT NULL AND (OLD.admin_response IS NULL OR OLD.admin_response != NEW.admin_response) THEN
    INSERT INTO notifications (user_id, type, title, message, link, created_at)
    VALUES (
      NEW.user_id,
      'feedback_response',
      'Réponse à votre avis',
      'L''administrateur a répondu à votre avis',
      '/profile',
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer une notification lors d'une réponse
DROP TRIGGER IF EXISTS trigger_feedback_response ON feedback;
CREATE TRIGGER trigger_feedback_response
  AFTER UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION notify_feedback_response();

COMMENT ON TABLE feedback IS 'Table pour stocker les avis et feedbacks des utilisateurs';
COMMENT ON COLUMN feedback.rating IS 'Note de 1 à 10';
COMMENT ON COLUMN feedback.status IS 'Statut: pending, reviewed, replied, archived';

