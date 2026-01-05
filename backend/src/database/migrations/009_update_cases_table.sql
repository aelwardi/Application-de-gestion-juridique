-- Migration: Update cases table
-- Description: Ajoute les colonnes manquantes et renomme category en case_type

-- Renommer category en case_type si la colonne existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'category'
  ) THEN
    ALTER TABLE cases RENAME COLUMN category TO case_type;
  END IF;
END $$;

-- Ajouter case_type si elle n'existe pas encore
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'case_type'
  ) THEN
    ALTER TABLE cases ADD COLUMN case_type VARCHAR(100);
  END IF;
END $$;

-- Ajouter opening_date si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'opening_date'
  ) THEN
    ALTER TABLE cases ADD COLUMN opening_date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Ajouter closing_date si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'closing_date'
  ) THEN
    ALTER TABLE cases ADD COLUMN closing_date DATE;
  END IF;
END $$;

-- Ajouter court_name si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'court_name'
  ) THEN
    ALTER TABLE cases ADD COLUMN court_name VARCHAR(255);
  END IF;
END $$;

-- Ajouter judge_name si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'judge_name'
  ) THEN
    ALTER TABLE cases ADD COLUMN judge_name VARCHAR(255);
  END IF;
END $$;

-- Mettre à jour les contraintes de statut pour correspondre à la nouvelle API
DO $$
BEGIN
  -- Supprimer l'ancienne contrainte si elle existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cases_status_check'
  ) THEN
    ALTER TABLE cases DROP CONSTRAINT cases_status_check;
  END IF;
  
  -- Ajouter la nouvelle contrainte
  ALTER TABLE cases ADD CONSTRAINT cases_status_check 
    CHECK (status IN ('pending', 'in_progress', 'on_hold', 'closed', 'archived'));
END $$;

-- Mettre à jour case_number pour être plus long (accepter le nouveau format)
DO $$
BEGIN
  ALTER TABLE cases ALTER COLUMN case_number TYPE VARCHAR(100);
END $$;

-- Créer l'index sur case_type s'il n'existe pas
CREATE INDEX IF NOT EXISTS idx_cases_case_type ON cases(case_type);

-- Mettre à jour les commentaires
COMMENT ON COLUMN cases.case_type IS 'Type de dossier (civil, pénal, commercial, familial, etc.)';
COMMENT ON COLUMN cases.opening_date IS 'Date d''ouverture du dossier';
COMMENT ON COLUMN cases.closing_date IS 'Date de clôture du dossier';
COMMENT ON COLUMN cases.court_name IS 'Nom du tribunal';
COMMENT ON COLUMN cases.judge_name IS 'Nom du juge';
COMMENT ON COLUMN cases.status IS 'Statut du dossier: pending, in_progress, on_hold, closed, archived';
