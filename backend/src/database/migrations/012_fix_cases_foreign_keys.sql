-- Migration: Corriger les foreign keys de la table cases
-- Les dossiers doivent être liés à lawyers.id et clients.id, pas à users.id

-- 1. Supprimer les anciennes contraintes
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_lawyer_id_fkey;
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_client_id_fkey;

-- 2. Ajouter les nouvelles contraintes avec les bonnes références
ALTER TABLE cases 
ADD CONSTRAINT cases_lawyer_id_fkey 
FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE SET NULL;

ALTER TABLE cases 
ADD CONSTRAINT cases_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

COMMENT ON TABLE cases IS 'Legal cases linked to lawyers (lawyers.id) and clients (clients.id)';
