import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.middleware';
import { pool } from '../config/database.config';

const router = express.Router();

const avatarStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const uploadDir = 'uploads/avatars/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seules les images (JPEG, PNG, GIF, WEBP) sont acceptées.'));
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  },
  fileFilter: imageFilter
});

/**
 * POST /api/upload/avatar
 * Upload une photo de profil pour l'utilisateur connecté
 */
router.post('/avatar', authenticate, uploadAvatar.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier fourni"
      });
    }

    const userId = (req as any).user?.userId;
    if (!userId) {
      fs.unlinkSync(req.file.path);
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié"
      });
    }

    const oldAvatarQuery = await pool.query(
      'SELECT profile_picture_url FROM users WHERE id = $1',
      [userId]
    );

    const oldAvatarUrl = oldAvatarQuery.rows[0]?.profile_picture_url;
    const avatarUrl = req.file.filename;
    console.log('new avatarUrl to save:', avatarUrl);

    const updateQuery = `
      UPDATE users 
      SET profile_picture_url = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, first_name, last_name, role, profile_picture_url, phone, is_verified, is_active
    `;

    const result = await pool.query(updateQuery, [avatarUrl, userId]);

    if (result.rows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    if (oldAvatarUrl && !oldAvatarUrl.includes('default-avatar')) {
      const oldFilePath = path.join(process.cwd(), 'uploads/avatars', oldAvatarUrl);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'ancienne photo:', error);
        }
      }
    }

    const user = result.rows[0];

    const transformedUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      profilePictureUrl: user.profile_picture_url,
      phone: user.phone,
      isVerified: user.is_verified,
      isActive: user.is_active
    };

    return res.json({
      success: true,
      message: "Photo de profil mise à jour avec succès",
      data: {
        user: transformedUser,
        avatarUrl
      }
    });

  } catch (error: any) {
    console.error('Erreur lors de l\'upload de l\'avatar:', error);

    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Erreur lors de la suppression du fichier:', unlinkError);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de l'upload de la photo de profil"
    });
  }
});

/**
 * DELETE /api/upload/avatar
 */
router.delete('/avatar', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié"
      });
    }

    const avatarQuery = await pool.query(
      'SELECT profile_picture_url FROM users WHERE id = $1',
      [userId]
    );

    const avatarUrl = avatarQuery.rows[0]?.profile_picture_url;

    const updateQuery = `
      UPDATE users 
      SET profile_picture_url = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, first_name, last_name, role, profile_picture_url, phone, is_verified, is_active
    `;

    const result = await pool.query(updateQuery, [userId]);

    if (avatarUrl && !avatarUrl.includes('default-avatar')) {
      const filePath = path.join(process.cwd(), 'uploads/avatars', avatarUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error('Erreur lors de la suppression du fichier:', error);
        }
      }
    }

    const user = result.rows[0];

    const transformedUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      profilePictureUrl: user.profile_picture_url,
      phone: user.phone,
      isVerified: user.is_verified,
      isActive: user.is_active
    };

    return res.json({
      success: true,
      message: "Photo de profil supprimée avec succès",
      data: {
        user: transformedUser
      }
    });

  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'avatar:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la suppression de la photo de profil"
    });
  }
});

export default router;