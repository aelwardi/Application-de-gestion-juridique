CREATE TABLE IF NOT EXISTS appointment_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  interval INTEGER NOT NULL DEFAULT 1,
  days_of_week INTEGER[],
  end_date DATE,
  occurrences INTEGER,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES appointment_series(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_series_id ON appointments(series_id) WHERE series_id IS NOT NULL;

COMMENT ON TABLE appointment_series IS 'Séries de rendez-vous récurrents';
COMMENT ON COLUMN appointments.series_id IS 'ID de la série si le rendez-vous fait partie d''une récurrence';