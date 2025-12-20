import { Request, Response } from 'express';
import { AvocatService } from '../services/Avocat.service';

export class AvocatController {
  static async create(req: Request, res: Response) {
    try {
      const avocat = await AvocatService.create(req.body);
      res.status(201).json({
        status: 'SUCCESS',
        message: 'Avocat et utilisateur créés avec succès',
        data: avocat,
      });
    } catch (error) {
      res.status(400).json({
        status: 'ERROR',
        message: 'Erreur lors de la création',
        error: (error as Error).message,
      });
    }
  }

  static async findAll(req: Request, res: Response) {
    try {
      const avocats = await AvocatService.findAll();
      res.status(200).json(avocats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      const avocat = await AvocatService.findById(req.params.id);
      if (!avocat) {
        return res.status(404).json({ error: 'Avocat non trouvé' });
      }
      res.status(200).json(avocat);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const avocat = await AvocatService.update(req.params.id, req.body);
      if (!avocat) {
        return res.status(404).json({ error: 'Avocat non trouvé' });
      }
      res.status(200).json(avocat);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const avocat = await AvocatService.delete(req.params.id);
      if (!avocat) {
        return res.status(404).json({ error: 'Avocat non trouvé' });
      }
      res.status(200).json({ message: 'Avocat supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async findByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const avocat = await AvocatService.findByEmail(email);

      if (!avocat) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Avocat non trouvé',
        });
      }

      res.json({
        status: 'SUCCESS',
        data: avocat,
      });
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        message: 'Erreur lors de la récupération',
        error: (error as Error).message,
      });
    }
  }
}