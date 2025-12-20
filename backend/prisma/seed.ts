import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed user
  const user = await prisma.users.create({
    data: {
      email: 'avocat1@mail.com',
      password_hash: 'hashedpassword',
      role: 'avocat',
      first_name: 'Jean',
      last_name: 'Dupont',
      phone: '0600000000',
      profile_picture_url: null,
      is_active: true,
      is_verified: true,
    },
  });

  // Seed avocat (lawyer)
  await prisma.avocat.create({
    data: {
      user_id: user.id,
      bar_number: 'BAR12345',
      specialties: ['Droit du travail', 'Droit pénal'],
      office_address: '123 rue de Paris',
      office_latitude: 48.8566,
      office_longitude: 2.3522,
      bio: 'Avocat expérimenté en droit du travail.',
      years_of_experience: 10,
      languages: ['français', 'anglais'],
      availability_status: 'available',
      rating: 4.5,
      total_cases: 120,
    },
  });
}

main()
  .then(() => {
    console.log('Seeding terminé');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    // process.exit(1);
  });