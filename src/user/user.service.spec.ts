import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

const mockUserModel = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    mockUserModel.create.mockImplementation((dto) => {
      return {
        ...dto,
        save: jest.fn().mockResolvedValue({ id: 'test-id', ...dto }),
      };
    });

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('find', () => {
    it('should find a user by username', async () => {
      const mockUser = { username: 'test@example.com', name: 'Test User' };
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.find('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        username: 'test@example.com',
      });
    });

    it('should return null if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.find('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { username: 'user1@example.com', name: 'User 1' },
        { username: 'user2@example.com', name: 'User 2' },
      ];
      mockUserModel.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserModel.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'new@example.com',
        password: 'password123',
        name: 'New User',
        phone: '1234567890',
        company: 'Test Company',
      };

      const savedUser = { ...createUserDto, _id: 'user-id' };

      const saveMock = jest.fn().mockResolvedValue(savedUser);
      mockUserModel.constructor.mockImplementation(() => ({
        save: saveMock,
      }));

      const result = await service.create(createUserDto);

      expect(result).toEqual(savedUser);
      expect(mockUserModel.constructor).toHaveBeenCalledWith(createUserDto);
      expect(saveMock).toHaveBeenCalled();
    });
  });
});
