import { Request, Response } from 'express';
import { UserController } from '../../../src/controllers/user.controller';
import { CreateUserInput, UpdateUserInput } from '../../../src/types/users.types';
import * as adminQueries from '../../../src/database/queries/admin.queries';

jest.mock('../../../src/services/user.service', () => {
  const mockFunctions = {
    createUser: jest.fn(),
    getUserById: jest.fn(),
    getAllUsers: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };
  return {
    UserService: jest.fn().mockImplementation(() => mockFunctions),
    mockFunctions,
  };
});

jest.mock('../../../src/database/queries/admin.queries');

const { mockFunctions } = jest.requireMock('../../../src/services/user.service');
const mockCreateUser = mockFunctions.createUser;
const mockGetUserById = mockFunctions.getUserById;
const mockGetAllUsers = mockFunctions.getAllUsers;
const mockUpdateUser = mockFunctions.updateUser;
const mockDeleteUser = mockFunctions.deleteUser;

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'client' as const,
    first_name: 'John',
    last_name: 'Doe',
    phone: '+1234567890',
    profile_picture_url: null,
    is_active: true,
    is_verified: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);

    userController = new UserController();

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();

    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('createUser', () => {
    it('devrait créer un utilisateur et retourner 201', async () => {
      const userData: CreateUserInput = {
        email: 'newuser@test.com',
        password: 'Test123!',
        role: 'client',
        first_name: 'New',
        last_name: 'User',
      };

      mockRequest.body = userData;
      mockCreateUser.mockResolvedValue(mockUser);

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockCreateUser).toHaveBeenCalledWith(userData);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'SUCCESS',
        message: 'Utilisateur créé',
        data: mockUser,
      });
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.body = {};
      mockCreateUser.mockRejectedValue(new Error('Database error'));

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'ERROR',
        message: 'Erreur création utilisateur',
        error: 'Database error',
      });
    });

    it('devrait gérer les erreurs de validation', async () => {
      mockRequest.body = { email: 'invalid' };
      mockCreateUser.mockRejectedValue(new Error('Validation failed'));

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ERROR',
          message: 'Erreur création utilisateur',
        })
      );
    });
  });

  describe('getUserById', () => {
    it('devrait retourner un utilisateur par ID', async () => {
      mockRequest.params = { id: 'user-123' };
      mockGetUserById.mockResolvedValue(mockUser);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockGetUserById).toHaveBeenCalledWith('user-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockGetUserById.mockResolvedValue(null);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.params = { id: 'user-123' };
      mockGetUserById.mockRejectedValue(new Error('Database error'));

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur récupération utilisateur',
        error: 'Database error',
      });
    });
  });

  describe('getAllUsers', () => {
    it('devrait retourner tous les utilisateurs avec pagination', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 'user-456' }];
      mockRequest.query = { limit: '10', offset: '0' };

      mockGetAllUsers.mockResolvedValue({
        users: mockUsers,
        total: 2,
      });

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockGetAllUsers).toHaveBeenCalledWith(10, 0);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
        pagination: {
          total: 2,
          limit: 10,
          offset: 0,
          count: 2,
        },
      });
    });

    it('devrait utiliser les valeurs par défaut pour limit et offset', async () => {
      mockRequest.query = {};
      mockGetAllUsers.mockResolvedValue({
        users: [],
        total: 0,
      });

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockGetAllUsers).toHaveBeenCalledWith(50, 0);
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.query = {};
      mockGetAllUsers.mockRejectedValue(new Error('Database error'));

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur récupération utilisateurs',
        error: 'Database error',
      });
    });

    it('devrait gérer les paramètres de pagination invalides', async () => {
      mockRequest.query = { limit: 'invalid', offset: 'invalid' };
      mockGetAllUsers.mockResolvedValue({
        users: [],
        total: 0,
      });

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockGetAllUsers).toHaveBeenCalledWith(50, 0);
    });
  });

  describe('updateUser', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      const updateData: UpdateUserInput = {
        first_name: 'Updated',
        last_name: 'Name',
      };

      mockRequest.params = { id: 'user-123' };
      mockRequest.body = updateData;

      const updatedUser = { ...mockUser, ...updateData };
      mockUpdateUser.mockResolvedValue(updatedUser);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUpdateUser).toHaveBeenCalledWith('user-123', updateData);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Utilisateur mis à jour',
        data: updatedUser,
      });
    });

    it('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockRequest.body = { first_name: 'Updated' };
      mockUpdateUser.mockResolvedValue(null);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.params = { id: 'user-123' };
      mockRequest.body = {};
      mockUpdateUser.mockRejectedValue(new Error('Database error'));

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur mise à jour utilisateur',
        error: 'Database error',
      });
    });

    it('devrait accepter une mise à jour partielle', async () => {
      const updateData: UpdateUserInput = {
        phone: '+0987654321',
      };

      mockRequest.params = { id: 'user-123' };
      mockRequest.body = updateData;

      const updatedUser = { ...mockUser, ...updateData };
      mockUpdateUser.mockResolvedValue(updatedUser);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUpdateUser).toHaveBeenCalledWith('user-123', updateData);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ phone: '+0987654321' }),
        })
      );
    });
  });

  describe('deleteUser', () => {
    it('devrait supprimer un utilisateur', async () => {
      mockRequest.params = { id: 'user-123' };
      mockDeleteUser.mockResolvedValue(true);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockDeleteUser).toHaveBeenCalledWith('user-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Utilisateur supprimé avec succès',
      });
    });

    it('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockDeleteUser.mockResolvedValue(false);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.params = { id: 'user-123' };
      mockDeleteUser.mockRejectedValue(new Error('Database error'));

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur suppression utilisateur',
        error: 'Database error',
      });
    });
  });
});