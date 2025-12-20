import { PrismaClient } from '@prisma/client';
import { Client, CreateClientInput } from '../models/Client.interface';

const prisma = new PrismaClient();

export class ClientService {
  static async create(input: CreateClientInput): Promise<Client> {
    const { user, ...clientData } = input;

    const result = await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur avec le role 'client'
      const createdUser = await tx.users.create({
        data: {
          ...user,
          role: 'client',
          is_active: true,
          is_verified: false,
        },
      });

      // Créer le client lié à cet utilisateur
      const createdClient = await tx.client.create({
        data: {
          address: clientData.address,
          city: clientData.city,
          postal_code: clientData.postal_code,
          country: clientData.country,
          date_of_birth: clientData.date_of_birth ? new Date(clientData.date_of_birth) : undefined,
          occupation: clientData.occupation,
          company_name: clientData.company_name,
          emergency_contact: clientData.emergency_contact,
          emergency_phone: clientData.emergency_phone,
          notes: clientData.notes,
          user: {
            connect: { id: createdUser.id }
          }
        },
        include: {
          user: true,
        },
      });

      return createdClient;
    });

    return result as unknown as Client;
  }

  static async findAll(): Promise<Client[]> {
    return prisma.client.findMany({
      include: {
        user: true,
      },
    }) as unknown as Client[];
  }

  static async findById(id: string): Promise<Client | null> {
    return prisma.client.findUnique({
      where: { id },
      include: {
        user: true,
      },
    }) as unknown as Client | null;
  }

  static async update(id: string, data: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<Client | null> {
    return prisma.client.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    }) as unknown as Client | null;
  }

  static async delete(id: string): Promise<Client | null> {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!client) {
      return null;
    }

    // Supprimer l'utilisateur, ce qui supprimera le client en cascade
    await prisma.users.delete({
      where: { id: client.user_id },
    });

    return client as unknown as Client;
  }

  static async findByEmail(email: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: {
        user: {
          email: email
        }
      },
      include: {
        user: true,
      },
    }) as unknown as Client | null;
  }
}