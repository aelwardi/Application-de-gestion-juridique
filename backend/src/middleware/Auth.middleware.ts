import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../models/Auth.interface';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Étendre le type Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'ERROR',
      message: 'Token manquant',
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'ERROR',
      message: 'Token invalide ou expiré',
    });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Non authentifié',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Accès interdit',
      });
    }

    next();
  };
};