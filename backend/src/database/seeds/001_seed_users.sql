INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, profile_picture_url, is_active, is_verified)
VALUES
('u1111111-1111-1111-1111-111111111111', 'admin@justice.com', 'hashed_password_admin', 'admin', 'Admin', 'User', '0600000001', NULL, true, true),
('u2222222-2222-2222-2222-222222222222', 'avocat1@justice.com', 'hashed_password_avocat', 'avocat', 'Jean', 'Dupont', '0600000002', NULL, true, false),
('u3333333-3333-3333-3333-333333333333', 'client1@justice.com', 'hashed_password_client', 'client', 'Marie', 'Durand', '0600000003', NULL, true, false),
('u4444444-4444-4444-4444-444444444444', 'collab1@justice.com', 'hashed_password_collab', 'collaborateur', 'Paul', 'Martin', '0600000004', NULL, true, false);

SELECT 'Seed users: 4 utilisateurs créés' AS result;
