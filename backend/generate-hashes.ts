const bcrypt = require('bcrypt');

const generateHashes = async () => {
  const passwords = {
    'Admin123!': 'admin@juridique.com',
    'Avocat123!': 'avocat@juridique.com',
    'Client123!': 'client@juridique.com',
    'Collab123!': 'collab@juridique.com'
  };

  console.log('=== Generated Password Hashes ===\n');

  for (const [password, email] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Hash: '${hash}'`);
    console.log('---');
  }

  console.log('\n=== SQL INSERT Statement ===\n');

  const hashes = await Promise.all([
    bcrypt.hash('Admin123!', 10),
    bcrypt.hash('Avocat123!', 10),
    bcrypt.hash('Client123!', 10),
    bcrypt.hash('Collab123!', 10)
  ]);

  console.log(`INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, is_verified) VALUES`);
  console.log(`-- password: Admin123!`);
  console.log(`('admin@juridique.com', '${hashes[0]}', 'admin', 'Admin', 'Système', '+33612345678', true, true),`);
  console.log(`-- password: Avocat123!`);
  console.log(`('avocat@juridique.com', '${hashes[1]}', 'avocat', 'Marie', 'Dupont', '+33687654321', true, true),`);
  console.log(`-- password: Client123!`);
  console.log(`('client@juridique.com', '${hashes[2]}', 'client', 'Jean', 'Martin', '+33698765432', true, true),`);
  console.log(`-- password: Collab123!`);
  console.log(`('collab@juridique.com', '${hashes[3]}', 'collaborateur', 'Sophie', 'Bernard', '+33623456789', true, true)`);
  console.log(`ON CONFLICT (email) DO NOTHING;`);
};

generateHashes().catch(console.error);