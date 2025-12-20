import { Request, Response } from 'express';
import { ClientService } from '../services/Client.service';

export class ClientController {
  static async create(req: Request, res: Response) {
    try {
      const client = await ClientService.create(req.body);
      res.status(201).json({
        status: 'SUCCESS',
        message: 'Client et utilisateur créés avec succès',
        data: client,
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
      const clients = await ClientService.findAll();
      res.json({
        status: 'SUCCESS',
        data: clients,
      });
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        message: 'Erreur lors de la récupération',
        error: (error as Error).message,
      });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const client = await ClientService.findById(id);
      
      if (!client) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Client non trouvé',
        });
      }

      res.json({
        status: 'SUCCESS',
        data: client,
      });
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        message: 'Erreur lors de la récupération',
        error: (error as Error).message,
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const client = await ClientService.update(id, req.body);
      
      if (!client) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Client non trouvé',
        });
      }

      res.json({
        status: 'SUCCESS',
        message: 'Client mis à jour avec succès',
        data: client,
      });
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        message: 'Erreur lors de la mise à jour',
        error: (error as Error).message,
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const client = await ClientService.delete(id);
      
      if (!client) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Client non trouvé',
        });
      }

      res.json({
        status: 'SUCCESS',
        message: 'Client supprimé avec succès',
      });
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        message: 'Erreur lors de la suppression',
        error: (error as Error).message,
      });
    }
  }

  static async findByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const client = await ClientService.findByEmail(email);
      
      if (!client) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Client non trouvé',
        });
      }

      res.json({
        status: 'SUCCESS',
        data: client,
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