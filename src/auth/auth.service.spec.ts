import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';

// Need to mock crypto functions
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mocksalt'),
  }),
  scrypt: jest.fn(),
}));

// Mock promisify to return our mocked scrypt function
jest.mock('util', () => ({
  promisify: jest.fn().mockImplementation((fn) => {
    return jest.fn().mockImplementation(() => {
      return Buffer.from('mockhash');
    });
  }),
}));

const mockUserService = {
  find: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user with hashed password', async () => {
      // Setup
      const createUserDto: CreateUserDto = {
        username: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '1234567890',
        company: 'Test Company',
      };

      mockUserService.find.mockResolvedValue(null);

      const createdUser = {
        id: 'user-id',
        username: createUserDto.username,
        name: createUserDto.name,
      };

      mockUserService.create.mockResolvedValue(createdUser);

      // Execute
      const result = await service.signup(createUserDto);

      // Verify
      expect(result).toEqual(createdUser);
      expect(mockUserService.find).toHaveBeenCalledWith(createUserDto.username);
      expect(mockUserService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: createUserDto.username,
          password: expect.stringContaining('mocksalt.'),
          name: createUserDto.name,
        }),
      );
    });

    it('should throw error if user already exists', async () => {
      // Setup
      const createUserDto: CreateUserDto = {
        username: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        phone: '1234567890',
        company: 'Test Company',
      };

      mockUserService.find.mockResolvedValue({
        id: 'existing-id',
        username: createUserDto.username,
      });

      // Execute & Verify
      await expect(service.signup(createUserDto)).rejects.toThrow(
        'User already exists',
      );
    });
  });

  describe('signin', () => {
    it('should throw NotFoundException if user is not found', async () => {
      const loginDto: LoginDto = {
        username: 'test@example.com',
        password: 'password123',
      };
      mockUserService.find.mockResolvedValue(null);

      await expect(service.signin(loginDto)).rejects.toThrow(NotFoundException);
      expect(mockUserService.find).toHaveBeenCalledWith(loginDto.username);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto: LoginDto = {
        username: 'test@example.com',
        password: 'wrongpassword',
      };

      // Mock a user with a known password format
      const user = {
        id: '1',
        username: 'test@example.com',
        // This format matches what our service expects: salt.hash
        password: 'mocksalt.differenthash',
      };

      mockUserService.find.mockResolvedValue(user);

      await expect(service.signin(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return access token if credentials are valid', async () => {
      const loginDto: LoginDto = {
        username: 'test@example.com',
        password: 'password123',
      };

      // Create a user with a password that will match our mocked hash
      const user = {
        id: '1',
        username: 'test@example.com',
        password: 'mocksalt.6d6f636b68617368', // 'mockhash' in hex
      };

      mockUserService.find.mockResolvedValue(user);

      const token = 'jwt-token';
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.signin(loginDto);

      expect(result).toEqual({ access_token: token });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: user.id,
        username: user.username,
      });
    });
  });
});
