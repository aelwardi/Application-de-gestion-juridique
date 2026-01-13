import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const createClientSchema = z.object({
  user_id: z.string().uuid({ message: "ID utilisateur invalide" }),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  emergency_contact_name: z.string().max(255).optional(),
  emergency_contact_phone: z.string().max(20).optional(),
  notes: z.string().optional(),
});

const updateClientSchema = z.object({
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  emergency_contact_name: z.string().max(255).optional(),
  emergency_contact_phone: z.string().max(20).optional(),
  notes: z.string().optional(),
}).partial();

const clientIdSchema = z.object({
  id: z.string().uuid({ message: "ID client invalide" }),
});

const userIdSchema = z.object({
  userId: z.string().uuid({ message: "ID utilisateur invalide" }),
});

export const validateCreateClient = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    createClientSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Données de validation invalides",
        errors: error.errors,
      });
      return;
    }
    next(error);
  }
};

export const validateUpdateClient = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    updateClientSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Données de validation invalides",
        errors: error.errors,
      });
      return;
    }
    next(error);
  }
};

export const validateClientId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    clientIdSchema.parse(req.params);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Données de validation invalides",
        errors: error.errors,
      });
      return;
    }
    next(error);
  }
};

export const validateUserId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    userIdSchema.parse(req.params);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "ID utilisateur invalide",
        errors: error.errors,
      });
      return;
    }
    next(error);
  }
};