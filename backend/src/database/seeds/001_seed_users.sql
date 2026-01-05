INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, is_verified) VALUES
-- password: Admin123!
('admin@juridique.com', '$2b$10$YQZ9J5Y.Z9J5Y.Z9J5Y.ZeuL5E9K9K9K9K9K9K9K9K9K9K9K9K9K9', 'admin', 'Admin', 'Système', '+33612345678', true, true),

-- password: Avocat123!
('avocat@juridique.com', '$2b$10$XQZ8I4X.Y8I4X.Y8I4X.YduK4D8J8J8J8J8J8J8J8J8J8J8J8J8J8', 'avocat', 'Marie', 'Dupont', '+33687654321', true, true),

-- password: Client123!
('client@juridique.com', '$2b$10$WPY7H3W.X7H3W.X7H3W.XctJ3C7I7I7I7I7I7I7I7I7I7I7I7I7I7', 'client', 'Jean', 'Martin', '+33698765432', true, true),

-- password: Collab123!
('collab@juridique.com', '$2b$10$VOX6G2V.W6G2V.W6G2V.WbsI2B6H6H6H6H6H6H6H6H6H6H6H6H6H6', 'collaborateur', 'Sophie', 'Bernard', '+33623456789', true, true)
ON CONFLICT (email) DO NOTHING;

