import { PrismaClient } from '@prisma/client';
import { Avocat, CreateAvocatInput } from '../models/Avocat.interface';

const prisma = new PrismaClient();

export class AvocatService {
  static async create(input: CreateAvocatInput): Promise<Avocat> {
    const { user, ...avocatData } = input;

    const result = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.users.create({
        data: {
          ...user,
          role: 'avocat',
          is_active: true,
          is_verified: false,
        },
      });

      const createdAvocat = await tx.avocat.create({
        data: {
          bar_number: avocatData.bar_number,
          specialties: avocatData.specialties,
          office_address: avocatData.office_address,
          office_latitude: avocatData.office_latitude,
          office_longitude: avocatData.office_longitude,
          bio: avocatData.bio,
          years_of_experience: avocatData.years_of_experience,
          languages: avocatData.languages,
          availability_status: avocatData.availability_status ?? 'available',
          rating: avocatData.rating ?? 0,
          total_cases: avocatData.total_cases ?? 0,
          user: {
            connect: { id: createdUser.id }
          }
        },
        include: {
          user: true,
        },
      });

      return createdAvocat;
    });

    return result as unknown as Avocat;
  }

  static async findAll(): Promise<Avocat[]> {
    return prisma.avocat.findMany({
      include: {
        user: true,
      },
    }) as unknown as Avocat[];
  }

  static async findById(id: string): Promise<Avocat | null> {
    return prisma.avocat.findUnique({
      where: { id },
      include: {
        user: true,
      },
    }) as unknown as Avocat | null;
  }

  static async update(id: string, data: Partial<Omit<Avocat, 'id' | 'created_at' | 'updated_at'>>): Promise<Avocat | null> {
    return prisma.avocat.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    }) as unknown as Avocat | null;
  }

  static async delete(id: string): Promise<Avocat | null> {
    const avocat = await prisma.avocat.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!avocat) {
      return null;
    }

    await prisma.users.delete({
      where: { id: avocat.user_id },
    });

    return avocat as unknown as Avocat;
  }

  static async findByEmail(email: string): Promise<Avocat | null> {
    return prisma.avocat.findFirst({
      where: {
        user: {
          email: email
        }
      },
      include: {
        user: true,
      },
    }) as unknown as Avocat | null;
  }
}