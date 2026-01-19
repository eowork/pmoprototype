import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';

describe('AuthService', () => {
  let service: AuthService;
  let dbService: DatabaseService;
  let jwtService: JwtService;

  const mockDbService = {
    query: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    dbService = module.get<DatabaseService>(DatabaseService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('service instantiation', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('validateUser', () => {
    it('should return null when user does not exist', async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.validateUser('nonexistent@test.com', 'password');

      expect(result).toBeNull();
      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT u.id'),
        ['nonexistent@test.com'],
      );
    });

    it('should return null when account is inactive', async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'test-uuid',
            email: 'test@test.com',
            password_hash: 'hash',
            is_active: false,
            google_id: null,
            failed_login_attempts: 0,
            account_locked_until: null,
          },
        ],
      });

      const result = await service.validateUser('test@test.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when account is locked', async () => {
      const futureDate = new Date(Date.now() + 60000).toISOString();
      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'test-uuid',
            email: 'test@test.com',
            password_hash: 'hash',
            is_active: true,
            google_id: null,
            failed_login_attempts: 5,
            account_locked_until: futureDate,
          },
        ],
      });

      const result = await service.validateUser('test@test.com', 'password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.login({ email: 'invalid@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.getProfile('nonexistent-uuid')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user profile with roles and permissions', async () => {
      // Mock user query
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'test-uuid',
              email: 'test@test.com',
              first_name: 'Test',
              last_name: 'User',
              avatar_url: null,
            },
          ],
        })
        // Mock roles query
        .mockResolvedValueOnce({
          rows: [{ id: 'role-uuid', name: 'Admin', is_superadmin: false }],
        })
        // Mock permissions query
        .mockResolvedValueOnce({
          rows: [{ name: 'read:users' }, { name: 'write:users' }],
        });

      const result = await service.getProfile('test-uuid');

      expect(result).toEqual({
        id: 'test-uuid',
        email: 'test@test.com',
        first_name: 'Test',
        last_name: 'User',
        avatar_url: null,
        roles: [{ id: 'role-uuid', name: 'Admin' }],
        is_superadmin: false,
        permissions: ['read:users', 'write:users'],
      });
    });
  });

  describe('logout', () => {
    it('should complete without error', async () => {
      await expect(service.logout('test-uuid')).resolves.not.toThrow();
    });
  });
});
