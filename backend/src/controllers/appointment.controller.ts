import { Request, Response } from 'express';
import * as appointmentService from '../services/appointment.service';
import * as appointmentDocumentsService from '../services/appointment-documents.service';
import * as adminQueries from '../database/queries/admin.queries';
import type { CreateAppointmentDTO, UpdateAppointmentDTO, AppointmentFilters } from '../types/appointment.types';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'appointments');
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

export const uploadMiddleware = upload.single('file');

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateAppointmentDTO = req.body;
    const appointment = await appointmentService.createAppointment(data);

    if (req.user?.userId) {
      try {
        await adminQueries.createActivityLog(
          req.user.userId,
          'APPOINTMENT_CREATED',
          'appointment',
          appointment.id,
          req.ip || req.socket.remoteAddress || null,
          req.get('user-agent') || null,
          {
            appointment_type: data.appointment_type,
            appointment_date: data.start_time,
            lawyer_id: data.lawyer_id,
            client_id: data.client_id
          }
        );
      } catch (logError) {
        console.error('Failed to log APPOINTMENT_CREATED activity:', logError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: AppointmentFilters = {
      status: req.query.status as any,
      appointment_type: req.query.appointment_type as any,
      lawyer_id: req.query.lawyer_id as string,
      client_id: req.query.client_id as string,
      case_id: req.query.case_id as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      search: req.query.search as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    const result = await appointmentService.getAllAppointments(filters);

    res.status(200).json({
      success: true,
      data: result.appointments,
      total: result.total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.getAppointmentById(id);

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Appointment not found') {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data: UpdateAppointmentDTO = req.body;
    const appointment = await appointmentService.updateAppointment(id, data);

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Appointment not found') {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await appointmentService.deleteAppointment(id);

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Appointment not found') {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAppointmentsByLawyer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lawyerId } = req.params;
    const filters: AppointmentFilters = {
      status: req.query.status as any,
      appointment_type: req.query.appointment_type as any,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    const appointments = await appointmentService.getAppointmentsByLawyer(lawyerId, filters);

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAppointmentsByClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    const filters: AppointmentFilters = {
      status: req.query.status as any,
      appointment_type: req.query.appointment_type as any,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    const appointments = await appointmentService.getAppointmentsByClient(clientId, filters);

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAppointmentsByCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { caseId } = req.params;
    const appointments = await appointmentService.getAppointmentsByCase(caseId);

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getUpcomingAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = req.query.lawyer_id as string | undefined;
    const clientId = req.query.client_id as string | undefined;
    const appointments = await appointmentService.getUpcomingAppointments(lawyerId, clientId);

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getTodayAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = req.query.lawyer_id as string | undefined;
    const clientId = req.query.client_id as string | undefined;
    const appointments = await appointmentService.getTodayAppointments(lawyerId, clientId);

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAppointmentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = req.query.lawyer_id as string | undefined;
    const clientId = req.query.client_id as string | undefined;
    const stats = await appointmentService.getAppointmentStats(lawyerId, clientId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const suggestion = req.body?.suggestion;
    const appointment = await appointmentService.cancelAppointment(id, suggestion);

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    if (error instanceof Error && error.message === 'Appointment not found') {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const confirmAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const suggestion = req.body?.suggestion;
    const appointment = await appointmentService.confirmAppointment(id, suggestion);

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: appointment
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Appointment not found') {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to confirm appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const completeAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.completeAppointment(id);

    res.status(200).json({
      success: true,
      message: 'Appointment completed successfully',
      data: appointment
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Appointment not found') {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to complete appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const uploadAppointmentDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: appointmentId } = req.params;
    const file = req.file;
    const { title, description, document_type, is_private } = req.body;
    const user = (req as any).user;

    if (!file) {
      res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
      return;
    }

    const fileUrl = `/api/storage/appointments/${file.filename}`;

    const document = await appointmentDocumentsService.createAppointmentDocument({
      appointment_id: appointmentId,
      uploaded_by: user.userId,
      document_type: document_type || 'other',
      title: title || file.originalname,
      description,
      file_name: file.originalname,
      file_size: file.size,
      file_type: file.mimetype,
      file_url: fileUrl,
      is_private: is_private === 'true' || is_private === true
    });

    res.status(201).json({
      success: true,
      message: 'Document uploadé avec succès',
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du document',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAppointmentDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: appointmentId } = req.params;
    const user = (req as any).user;

    const documents = await appointmentDocumentsService.getAppointmentDocuments(
      appointmentId,
      user.userId,
      user.role
    );

    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteAppointmentDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.params;
    const user = (req as any).user;

    await appointmentDocumentsService.deleteAppointmentDocument(docId, user.userId);

    res.status(200).json({
      success: true,
      message: 'Document supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du document',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateAppointmentNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: appointmentId } = req.params;
    const { private_notes, shared_notes } = req.body;

    const notes = await appointmentDocumentsService.updateAppointmentNotes(
      appointmentId,
      private_notes,
      shared_notes
    );

    res.status(200).json({
      success: true,
      message: 'Notes mises à jour avec succès',
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des notes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAppointmentNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: appointmentId } = req.params;
    const user = (req as any).user;

    const notes = await appointmentDocumentsService.getAppointmentNotes(
      appointmentId,
      user.userId,
      user.role
    );

    res.status(200).json({
      success: true,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const appointmentController = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByLawyer,
  getAppointmentsByClient,
  getAppointmentsByCase,
  getUpcomingAppointments,
  getTodayAppointments,
  getAppointmentStats,
  cancelAppointment,
  confirmAppointment,
  completeAppointment,
  uploadAppointmentDocument,
  getAppointmentDocuments,
  deleteAppointmentDocument,
  updateAppointmentNotes,
  getAppointmentNotes
};