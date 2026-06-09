import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/core';
import { AuthService } from './auth.service';
import {
  User,
  UserRole,
  Role,
  Permission,
  RolePermission,
  UserPermissionOverride,
  UserModuleAssignment,
  UserPillarAssignment,
} from '../database/entities';

describe('AuthService', () => {
  let service: AuthService;

  const mockEm = {
    findOne: jest.fn(),
    find: jest.fn(),
    flush: jest.fn(),
    persistAndFlush: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: EntityManager, useValue: mockEm },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('service instantiation', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('validateUser', () => {
    it('should return null when user does not exist', async () => {
      mockEm.findOne.mockResolvedValueOnce(null);

      const result = await service.validateUser(
        'nonexistent@test.com',
        'password',
      );

      expect(result).toBeNull();
      expect(mockEm.findOne).toHaveBeenCalledWith(User, expect.any(Object));
    });

    it('should return null when account is inactive', async () => {
      mockEm.findOne.mockResolvedValueOnce({
        id: 'test-uuid',
        email: 'test@test.com',
        passwordHash: 'hash',
        isActive: false,
        googleId: null,
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      });

      const result = await service.validateUser('test@test.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when account is locked', async () => {
      const futureDate = new Date(Date.now() + 60000);
      mockEm.findOne.mockResolvedValueOnce({
        id: 'test-uuid',
        email: 'test@test.com',
        passwordHash: 'hash',
        isActive: true,
        googleId: null,
        failedLoginAttempts: 5,
        accountLockedUntil: futureDate,
      });

      const result = await service.validateUser('test@test.com', 'password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockEm.findOne.mockResolvedValueOnce(null);

      await expect(
        service.login({ identifier: 'invalid@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      mockEm.findOne.mockResolvedValueOnce(null);

      await expect(service.getProfile('nonexistent-uuid')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user profile with roles and permissions', async () => {
      mockEm.findOne.mockResolvedValueOnce({
        id: 'test-uuid',
        email: 'test@test.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        avatarUrl: null,
        rankLevel: null,
        campus: null,
      });

      mockEm.find.mockImplementation((entity: any) => {
        if (entity === UserRole) {
          return Promise.resolve([
            { roleId: 'role-uuid', userId: 'test-uuid', isSuperadmin: false },
          ]);
        }
        if (entity === Role) {
          return Promise.resolve([{ id: 'role-uuid', name: 'Admin' }]);
        }
        if (entity === RolePermission) {
          return Promise.resolve([
            { roleId: 'role-uuid', permissionId: 'perm-1' },
            { roleId: 'role-uuid', permissionId: 'perm-2' },
          ]);
        }
        if (entity === Permission) {
          return Promise.resolve([
            { id: 'perm-1', name: 'read:users' },
            { id: 'perm-2', name: 'write:users' },
          ]);
        }
        if (entity === UserPermissionOverride) return Promise.resolve([]);
        if (entity === UserModuleAssignment) return Promise.resolve([]);
        if (entity === UserPillarAssignment) return Promise.resolve([]);
        return Promise.resolve([]);
      });

      const result = await service.getProfile('test-uuid');

      expect(result).toMatchObject({
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
