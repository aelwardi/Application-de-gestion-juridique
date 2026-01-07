import { UserService } from '../../../src/services/user.service';
import { pool } from '../../../src/config/database.config';
import { mockUser, mockQueryResult } from '../../helpers/mock-helpers';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../../src/config/database.config');

describe('UserService', () => {
  let userService: UserService;
  let mockPool: jest.Mocked<typeof pool>;

  beforeEach(() => {
    userService = new UserService();
    mockPool = pool as jest.Mocked<typeof pool>;
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'Test123!',
        role: 'client' as const,
        first_name: 'New',
        last_name: 'User',
        phone: '+1234567890',
      };

      const expectedUser = mockUser({
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        phone: userData.phone,
      });

      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([expectedUser]));

      const user = await userService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.first_name).toBe(userData.first_name);
      expect(user.last_name).toBe(userData.last_name);
      expect(user.role).toBe(userData.role);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should hash the password', async () => {
      const userData = {
        email: 'hashtest@test.com',
        password: 'PlainPassword123!',
        role: 'client' as const,
        first_name: 'Hash',
        last_name: 'Test',
      };

      const expectedUser = mockUser({ email: userData.email });
      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([expectedUser]));

      await userService.createUser(userData);

      const queryCall = mockPool.query.mock.calls[0];
      const hashedPassword = queryCall[1][1];

      expect(hashedPassword).not.toBe(userData.password);
      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
    });

    it('should handle optional fields', async () => {
      const userData = {
        email: 'minimal@test.com',
        password: 'Test123!',
        role: 'avocat' as const,
        first_name: 'Min',
        last_name: 'User',
      };

      const expectedUser = mockUser(userData);
      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([expectedUser]));

      const user = await userService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.phone).toBeDefined();
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const userId = uuidv4();
      const expectedUser = mockUser({ id: userId });

      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([expectedUser]));

      const user = await userService.getUserById(userId);

      expect(user).toBeDefined();
      expect(user?.id).toBe(userId);
      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [userId]);
    });

    it('should return null if user not found', async () => {
      const userId = uuidv4();
      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([]));

      const user = await userService.getUserById(userId);

      expect(user).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with pagination', async () => {
      const users = [
        mockUser({ email: 'user1@test.com' }),
        mockUser({ email: 'user2@test.com' }),
        mockUser({ email: 'user3@test.com' }),
      ];

      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult(users));
      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([{ count: '3' }]));

      const result = await userService.getAllUsers(50, 0);

      expect(result.users).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });

    it('should handle pagination parameters', async () => {
      const users = [mockUser()];
      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult(users));
      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([{ count: '100' }]));

      const result = await userService.getAllUsers(10, 20);

      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [10, 20]);
      expect(result.total).toBe(100);
    });

    it('should return empty array when no users', async () => {
      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([]));
      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([{ count: '0' }]));

      const result = await userService.getAllUsers();

      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = uuidv4();
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
      };

      const updatedUser = mockUser({
        id: userId,
        ...updateData
      });

      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([updatedUser]));

      const user = await userService.updateUser(userId, updateData);

      expect(user).toBeDefined();
      expect(user?.first_name).toBe(updateData.first_name);
      expect(user?.last_name).toBe(updateData.last_name);
    });

    it('should handle partial updates', async () => {
      const userId = uuidv4();
      const updateData = { phone: '+9876543210' };

      const updatedUser = mockUser({ id: userId, phone: updateData.phone });
      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([updatedUser]));

      const user = await userService.updateUser(userId, updateData);

      expect(user?.phone).toBe(updateData.phone);
    });

    it('should return current user if no data to update', async () => {
      const userId = uuidv4();
      const currentUser = mockUser({ id: userId });

      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([currentUser]));

      const user = await userService.updateUser(userId, {});

      expect(user).toBeDefined();
      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [userId]);
    });

    it('should return null if user not found', async () => {
      const userId = uuidv4();
      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([]));

      const user = await userService.updateUser(userId, { first_name: 'Test' });

      expect(user).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = uuidv4();
      const deletedUser = mockUser({ id: userId });

      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([deletedUser]));

      const result = await userService.deleteUser(userId);

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [userId]);
    });

    it('should return false if user not found', async () => {
      const userId = uuidv4();
      (mockPool.query as any).mockResolvedValueOnce(mockQueryResult([]));

      const result = await userService.deleteUser(userId);

      expect(result).toBe(false);
    });
  });
});