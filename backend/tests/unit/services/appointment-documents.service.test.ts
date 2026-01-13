import * as appointmentDocumentsService from '../../../src/services/appointment-documents.service';
import { pool } from '../../../src/config/database.config';

jest.mock('../../../src/config/database.config');

describe('AppointmentDocumentsService', () => {
  const mockPool = pool as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointmentDocument', () => {
    it('should create a document successfully', async () => {
      const mockDocument = {
        id: 'doc-123',
        appointment_id: 'apt-123',
        uploaded_by: 'user-123',
        document_type: 'contract',
        title: 'Test Document',
        description: 'Test description',
        file_name: 'test.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        file_url: '/uploads/test.pdf',
        is_private: false,
        created_at: new Date(),
      };

      mockPool.query.mockResolvedValue({ rows: [mockDocument], rowCount: 1 } as any);

      const data = {
        appointment_id: 'apt-123',
        uploaded_by: 'user-123',
        document_type: 'contract',
        title: 'Test Document',
        description: 'Test description',
        file_name: 'test.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        file_url: '/uploads/test.pdf',
        is_private: false,
      };

      const result = await appointmentDocumentsService.createAppointmentDocument(data);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO appointment_documents'),
        expect.arrayContaining([
          data.appointment_id,
          data.uploaded_by,
          data.document_type,
          data.title,
          data.description,
          data.file_name,
          data.file_size,
          data.file_type,
          data.file_url,
          data.is_private,
        ])
      );
      expect(result).toEqual(mockDocument);
    });

    it('should create a document with null description', async () => {
      const mockDocument = {
        id: 'doc-123',
        appointment_id: 'apt-123',
        uploaded_by: 'user-123',
        document_type: 'contract',
        title: 'Test Document',
        description: null,
        file_name: 'test.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        file_url: '/uploads/test.pdf',
        is_private: false,
        created_at: new Date(),
      };

      mockPool.query.mockResolvedValue({ rows: [mockDocument], rowCount: 1 } as any);

      const data = {
        appointment_id: 'apt-123',
        uploaded_by: 'user-123',
        document_type: 'contract',
        title: 'Test Document',
        file_name: 'test.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        file_url: '/uploads/test.pdf',
        is_private: false,
      };

      const result = await appointmentDocumentsService.createAppointmentDocument(data);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([null])
      );
      expect(result).toEqual(mockDocument);
    });

    it('should throw error when database query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      const data = {
        appointment_id: 'apt-123',
        uploaded_by: 'user-123',
        document_type: 'contract',
        title: 'Test Document',
        file_name: 'test.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        file_url: '/uploads/test.pdf',
        is_private: false,
      };

      await expect(
        appointmentDocumentsService.createAppointmentDocument(data)
      ).rejects.toThrow('Database error');
    });
  });

  describe('getAppointmentDocuments', () => {
    it('should get all documents for lawyer', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          appointment_id: 'apt-123',
          title: 'Document 1',
          is_private: true,
          uploader_name: 'John Doe',
          uploader_role: 'avocat',
        },
        {
          id: 'doc-2',
          appointment_id: 'apt-123',
          title: 'Document 2',
          is_private: false,
          uploader_name: 'Jane Smith',
          uploader_role: 'client',
        },
      ];

      mockPool.query.mockResolvedValue({ rows: mockDocuments, rowCount: 2 } as any);

      const result = await appointmentDocumentsService.getAppointmentDocuments(
        'apt-123',
        'lawyer-123',
        'avocat'
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['apt-123']
      );
      expect(result).toEqual(mockDocuments);
      expect(result).toHaveLength(2);
    });

    it('should filter private documents for non-lawyer users', async () => {
      const mockDocuments = [
        {
          id: 'doc-2',
          appointment_id: 'apt-123',
          title: 'Document 2',
          is_private: false,
          uploader_name: 'Jane Smith',
          uploader_role: 'client',
        },
      ];

      mockPool.query.mockResolvedValue({ rows: mockDocuments, rowCount: 1 } as any);

      const result = await appointmentDocumentsService.getAppointmentDocuments(
        'apt-123',
        'client-123',
        'client'
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('is_private = false'),
        ['apt-123']
      );
      expect(result).toEqual(mockDocuments);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no documents found', async () => {
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 } as any);

      const result = await appointmentDocumentsService.getAppointmentDocuments(
        'apt-123',
        'user-123',
        'client'
      );

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error when database query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(
        appointmentDocumentsService.getAppointmentDocuments('apt-123', 'user-123', 'client')
      ).rejects.toThrow('Database error');
    });
  });

  describe('getAppointmentDocumentById', () => {
    it('should get document by id for authorized user', async () => {
      const mockDocument = {
        id: 'doc-123',
        appointment_id: 'apt-123',
        title: 'Test Document',
        is_private: false,
        lawyer_id: 'lawyer-123',
        uploader_name: 'John Doe',
      };

      mockPool.query.mockResolvedValue({ rows: [mockDocument], rowCount: 1 } as any);

      const result = await appointmentDocumentsService.getAppointmentDocumentById(
        'doc-123',
        'client-123',
        'client'
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['doc-123']
      );
      expect(result).toEqual(mockDocument);
    });

    it('should return null when document not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 } as any);

      const result = await appointmentDocumentsService.getAppointmentDocumentById(
        'doc-999',
        'user-123',
        'client'
      );

      expect(result).toBeNull();
    });

    it('should throw error when non-lawyer tries to access private document', async () => {
      const mockDocument = {
        id: 'doc-123',
        appointment_id: 'apt-123',
        title: 'Private Document',
        is_private: true,
        lawyer_id: 'lawyer-123',
        uploader_name: 'John Doe',
      };

      mockPool.query.mockResolvedValue({ rows: [mockDocument], rowCount: 1 } as any);

      await expect(
        appointmentDocumentsService.getAppointmentDocumentById(
          'doc-123',
          'client-123',
          'client'
        )
      ).rejects.toThrow('Accès non autorisé à ce document');
    });

    it('should allow lawyer to access private document', async () => {
      const mockDocument = {
        id: 'doc-123',
        appointment_id: 'apt-123',
        title: 'Private Document',
        is_private: true,
        lawyer_id: 'lawyer-123',
        uploader_name: 'John Doe',
      };

      mockPool.query.mockResolvedValue({ rows: [mockDocument], rowCount: 1 } as any);

      const result = await appointmentDocumentsService.getAppointmentDocumentById(
        'doc-123',
        'lawyer-123',
        'avocat'
      );

      expect(result).toEqual(mockDocument);
    });

    it('should throw error when database query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(
        appointmentDocumentsService.getAppointmentDocumentById('doc-123', 'user-123', 'client')
      ).rejects.toThrow('Database error');
    });
  });

  describe('updateAppointmentDocument', () => {
    it('should update document successfully', async () => {
      const mockUpdatedDocument = {
        id: 'doc-123',
        title: 'Updated Title',
        description: 'Updated description',
        document_type: 'updated-type',
        is_private: true,
        updated_at: new Date(),
      };

      mockPool.query.mockResolvedValue({ rows: [mockUpdatedDocument], rowCount: 1 } as any);

      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
        document_type: 'updated-type',
        is_private: true,
      };

      const result = await appointmentDocumentsService.updateAppointmentDocument(
        'doc-123',
        updateData,
        'user-123'
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appointment_documents'),
        expect.any(Array)
      );
      expect(result).toEqual(mockUpdatedDocument);
    });

    it('should update only title', async () => {
      const mockUpdatedDocument = {
        id: 'doc-123',
        title: 'Updated Title Only',
        updated_at: new Date(),
      };

      mockPool.query.mockResolvedValue({ rows: [mockUpdatedDocument], rowCount: 1 } as any);

      const result = await appointmentDocumentsService.updateAppointmentDocument(
        'doc-123',
        { title: 'Updated Title Only' },
        'user-123'
      );

      expect(result).toEqual(mockUpdatedDocument);
    });

    it('should return null when document not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 } as any);

      const result = await appointmentDocumentsService.updateAppointmentDocument(
        'doc-999',
        { title: 'New Title' },
        'user-123'
      );

      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(
        appointmentDocumentsService.updateAppointmentDocument(
          'doc-123',
          { title: 'New Title' },
          'user-123'
        )
      ).rejects.toThrow('Database error');
    });
  });
});