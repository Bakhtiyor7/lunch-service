import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from './admin-guard';
import {
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminGuard],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if user is not authenticated', () => {
    // Create a mock execution context with no user
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: null,
        }),
      }),
    } as ExecutionContext;

    // Assert that the guard throws UnauthorizedException
    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException if user is not an admin', () => {
    // Create a mock execution context with a non-admin user
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-id',
            username: 'regular-user',
            isAdmin: false,
          },
        }),
      }),
    } as ExecutionContext;

    // Assert that the guard throws ForbiddenException
    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should allow access if user is an admin', () => {
    // Create a mock execution context with an admin user
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'admin-id',
            username: 'admin-user',
            isAdmin: true,
          },
        }),
      }),
    } as ExecutionContext;

    // Assert that the guard allows access
    expect(guard.canActivate(mockContext)).toBe(true);
  });
});
