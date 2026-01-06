import { pool } from '../config/database.config';
import fs from 'fs/promises';
import path from 'path';

interface CreateAppointmentDocumentDTO {
  appointment_id: string;
  uploaded_by: string;
  document_type: string;
  title: string;
  description?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  is_private: boolean;
}

interface UpdateAppointmentDocumentDTO {
  title?: string;
  description?: string;
  document_type?: string;
  is_private?: boolean;
}

/**
 * Créer un document de rendez-vous
 */
export const createAppointmentDocument = async (data: CreateAppointmentDocumentDTO) => {
  try {
    const query = `
      INSERT INTO appointment_documents (
        appointment_id, uploaded_by, document_type, title, description,
        file_name, file_size, file_type, file_url, is_private
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await pool.query(query, [
      data.appointment_id,
      data.uploaded_by,
      data.document_type,
      data.title,
      data.description || null,
      data.file_name,
      data.file_size,
      data.file_type,
      data.file_url,
      data.is_private
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la création du document:', error);
    throw error;
  }
};

/**
 * Récupérer tous les documents d'un rendez-vous
 */
export const getAppointmentDocuments = async (
  appointmentId: string,
  userId: string,
  userRole: string
) => {
  try {
    let query = `
      SELECT 
        ad.*,
        CONCAT(u.first_name, ' ', u.last_name) as uploader_name,
        u.role as uploader_role
      FROM appointment_documents ad
      LEFT JOIN users u ON ad.uploaded_by = u.id
      WHERE ad.appointment_id = $1
    `;

    const params: any[] = [appointmentId];

    if (userRole !== 'avocat') {
      query += ` AND ad.is_private = false`;
    }

    query += ` ORDER BY ad.created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    throw error;
  }
};

/**
 * Récupérer un document par ID
 */
export const getAppointmentDocumentById = async (
  documentId: string,
  userId: string,
  userRole: string
) => {
  try {
    let query = `
      SELECT 
        ad.*,
        a.lawyer_id,
        CONCAT(u.first_name, ' ', u.last_name) as uploader_name
      FROM appointment_documents ad
      LEFT JOIN appointments a ON ad.appointment_id = a.id
      LEFT JOIN users u ON ad.uploaded_by = u.id
      WHERE ad.id = $1
    `;

    const result = await pool.query(query, [documentId]);

    if (result.rows.length === 0) {
      return null;
    }

    const document = result.rows[0];

    if (document.is_private && userRole !== 'avocat' && document.lawyer_id !== userId) {
      throw new Error('Accès non autorisé à ce document');
    }

    return document;
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    throw error;
  }
};

/**
 * Mettre à jour un document
 */
export const updateAppointmentDocument = async (
  documentId: string,
  data: UpdateAppointmentDocumentDTO,
  userId: string
) => {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(data.title);
      paramIndex++;
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(data.description);
      paramIndex++;
    }

    if (data.document_type !== undefined) {
      updates.push(`document_type = $${paramIndex}`);
      values.push(data.document_type);
      paramIndex++;
    }

    if (data.is_private !== undefined) {
      updates.push(`is_private = $${paramIndex}`);
      values.push(data.is_private);
      paramIndex++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(documentId);

    const query = `
      UPDATE appointment_documents
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    throw error;
  }
};

/**
 * Supprimer un document
 */
export const deleteAppointmentDocument = async (
  documentId: string,
  userId: string
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const docResult = await client.query(
      'SELECT * FROM appointment_documents WHERE id = $1',
      [documentId]
    );

    if (docResult.rows.length === 0) {
      throw new Error('Document non trouvé');
    }

    const document = docResult.rows[0];

    try {
      const filePath = path.join(process.cwd(), 'uploads', document.file_url.replace('/api/storage/', ''));
      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn('Impossible de supprimer le fichier physique:', fileError);
    }

    await client.query('DELETE FROM appointment_documents WHERE id = $1', [documentId]);

    await client.query('COMMIT');

    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la suppression du document:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Mettre à jour les notes d'un rendez-vous
 */
export const updateAppointmentNotes = async (
  appointmentId: string,
  privateNotes?: string,
  sharedNotes?: string
) => {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (privateNotes !== undefined) {
      updates.push(`private_notes = $${paramIndex}`);
      values.push(privateNotes);
      paramIndex++;
    }

    if (sharedNotes !== undefined) {
      updates.push(`shared_notes = $${paramIndex}`);
      values.push(sharedNotes);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw new Error('Aucune note à mettre à jour');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(appointmentId);

    const query = `
      UPDATE appointments
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, private_notes, shared_notes
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Rendez-vous non trouvé');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notes:', error);
    throw error;
  }
};

/**
 * Récupérer les notes d'un rendez-vous
 */
export const getAppointmentNotes = async (
  appointmentId: string,
  userId: string,
  userRole: string
) => {
  try {
    const query = `
      SELECT 
        id,
        private_notes,
        shared_notes,
        lawyer_id
      FROM appointments
      WHERE id = $1
    `;

    const result = await pool.query(query, [appointmentId]);

    if (result.rows.length === 0) {
      throw new Error('Rendez-vous non trouvé');
    }

    const notes = result.rows[0];

    if (userRole !== 'avocat' && notes.lawyer_id !== userId) {
      delete notes.private_notes;
    }

    return notes;
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    throw error;
  }
};

export default {
  createAppointmentDocument,
  getAppointmentDocuments,
  getAppointmentDocumentById,
  updateAppointmentDocument,
  deleteAppointmentDocument,
  updateAppointmentNotes,
  getAppointmentNotes
};