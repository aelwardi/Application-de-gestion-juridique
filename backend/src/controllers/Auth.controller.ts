import { Request, Response } from 'express';
import { AuthService } from '../services/Auth.service';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Email et mot de passe requis',
        });
      }

      const result = await AuthService.login({ email, password });

      res.json({
        status: 'SUCCESS',
        message: 'Connexion réussie',
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        status: 'ERROR',
        message: (error as Error).message,
      });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Refresh token requis',
        });
      }

      const result = await AuthService.refreshToken(refresh_token);

      res.json({
        status: 'SUCCESS',
        message: 'Token rafraîchi avec succès',
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        status: 'ERROR',
        message: (error as Error).message,
      });
    }
  }

  static async verifyToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          status: 'ERROR',
          message: 'Token manquant',
        });
      }

      const token = authHeader.substring(7);
      const decoded = await AuthService.verifyToken(token);

      res.json({
        status: 'SUCCESS',
        message: 'Token valide',
        data: decoded,
      });
    } catch (error) {
      res.status(401).json({
        status: 'ERROR',
        message: (error as Error).message,
      });
    }
  }
}