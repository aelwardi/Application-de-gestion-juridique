INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, is_verified) VALUES
-- password: Admin123!
('admin@juridique.com', '$2b$10$xQZ9J5YZ9J5YZ9J5YZ9J5uP8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q', 'admin', 'Admin', 'Système', '+33612345678', true, true),

-- password: Avocat123!
('avocat@juridique.com', '$2b$10$xQZ9J5YZ9J5YZ9J5YZ9J5uP8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q', 'avocat', 'Marie', 'Dupont', '+33687654321', true, true),

-- password: Client123!
('client@juridique.com', '$2b$10$xQZ9J5YZ9J5YZ9J5YZ9J5uP8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q', 'client', 'Jean', 'Martin', '+33698765432', true, true),

-- password: Collab123!
('collab@juridique.com', '$2b$10$xQZ9J5YZ9J5YZ9J5YZ9J5uP8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q', 'collaborateur', 'Sophie', 'Bernard', '+33623456789', true, true);

