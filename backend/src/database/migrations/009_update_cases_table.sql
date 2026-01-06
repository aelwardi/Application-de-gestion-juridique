DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'category'
  ) THEN
    ALTER TABLE cases RENAME COLUMN category TO case_type;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'case_type'
  ) THEN
    ALTER TABLE cases ADD COLUMN case_type VARCHAR(100);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'opening_date'
  ) THEN
    ALTER TABLE cases ADD COLUMN opening_date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'closing_date'
  ) THEN
    ALTER TABLE cases ADD COLUMN closing_date DATE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'court_name'
  ) THEN
    ALTER TABLE cases ADD COLUMN court_name VARCHAR(255);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'judge_name'
  ) THEN
    ALTER TABLE cases ADD COLUMN judge_name VARCHAR(255);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cases_status_check'
  ) THEN
    ALTER TABLE cases DROP CONSTRAINT cases_status_check;
  END IF;
  
  ALTER TABLE cases ADD CONSTRAINT cases_status_check
    CHECK (status IN ('pending', 'in_progress', 'on_hold', 'closed', 'archived'));
END $$;

DO $$
BEGIN
  ALTER TABLE cases ALTER COLUMN case_number TYPE VARCHAR(100);
END $$;

CREATE INDEX IF NOT EXISTS idx_cases_case_type ON cases(case_type);

COMMENT ON COLUMN cases.case_type IS 'Type de dossier (civil, pénal, commercial, familial, etc.)';
COMMENT ON COLUMN cases.opening_date IS 'Date d''ouverture du dossier';
COMMENT ON COLUMN cases.closing_date IS 'Date de clôture du dossier';
COMMENT ON COLUMN cases.court_name IS 'Nom du tribunal';
COMMENT ON COLUMN cases.judge_name IS 'Nom du juge';
COMMENT ON COLUMN cases.status IS 'Statut du dossier: pending, in_progress, on_hold, closed, archived';