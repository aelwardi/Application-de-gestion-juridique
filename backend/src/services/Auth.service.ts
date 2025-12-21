import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { LoginInput, LoginResponse, TokenPayload } from '../models/Auth.interface';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

export class AuthService {
  static async login(input: LoginInput): Promise<LoginResponse> {
    const { email, password } = input;

    // Rechercher l'utilisateur par email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier si l'utilisateur est actif
    if (!user.is_active) {
      throw new Error('Compte désactivé');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Mettre à jour la date de dernière connexion
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // Générer les tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as SignOptions);

    const refresh_token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    } as SignOptions);

    // Calculer le temps d'expiration en secondes
    const expires_in = this.parseExpirationTime(JWT_EXPIRES_IN);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture_url: user.profile_picture_url || undefined,
      },
      access_token,
      refresh_token,
      expires_in,
    };
  }

  static async refreshToken(token: string): Promise<LoginResponse> {
    try {
      // Vérifier et décoder le refresh token
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

      // Récupérer l'utilisateur
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.is_active) {
        throw new Error('Utilisateur non trouvé ou inactif');
      }

      // Générer de nouveaux tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const access_token = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      } as SignOptions);

      const refresh_token = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      } as SignOptions);

      const expires_in = this.parseExpirationTime(JWT_EXPIRES_IN);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          profile_picture_url: user.profile_picture_url || undefined,
        },
        access_token,
        refresh_token,
        expires_in,
      };
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  static async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  private static parseExpirationTime(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 604800; // 7 jours par défaut
    }
  }
}