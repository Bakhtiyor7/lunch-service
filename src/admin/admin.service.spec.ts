import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getModelToken } from '@nestjs/mongoose';
import { ProductPolicy } from '../product/schema/product-policy.schema';
import { User } from '../user/schema/user.schema';
import { BadRequestException } from '@nestjs/common';
import { ProductPolicyDto } from '../product/dto/product-policy.dto';

const mockProductPolicyModel = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockUserModel = {
  findById: jest.fn(),
};

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken(ProductPolicy.name),
          useValue: mockProductPolicyModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setPolicy', () => {
    it('should throw BadRequestException if neither price nor hidden is provided', async () => {
      const policyDto: ProductPolicyDto = {
        productId: 1,
        userId: 'user-id',
      };

      await expect(service.setPolicy(policyDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user not found', async () => {
      const policyDto: ProductPolicyDto = {
        productId: 1,
        userId: 'nonexistent-user',
        price: 15,
      };

      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.setPolicy(policyDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserModel.findById).toHaveBeenCalledWith(policyDto.userId);
    });

    it('should update existing policy if one exists', async () => {
      const policyDto: ProductPolicyDto = {
        productId: 1,
        userId: 'user-id',
        price: 15,
        hidden: true,
      };

      const user = { _id: 'user-id' };
      mockUserModel.findById.mockResolvedValue(user);

      const existingPolicy = {
        productId: 1,
        userId: 'user-id',
        price: 10,
        hidden: false,
        save: jest.fn().mockResolvedValue({
          productId: 1,
          userId: 'user-id',
          price: 15,
          hidden: true,
        }),
      };

      mockProductPolicyModel.findOne.mockResolvedValue(existingPolicy);

      const result = await service.setPolicy(policyDto);

      expect(result).toEqual({
        productId: 1,
        userId: 'user-id',
        price: 15,
        hidden: true,
      });

      expect(existingPolicy.price).toBe(15);
      expect(existingPolicy.hidden).toBe(true);
      expect(existingPolicy.save).toHaveBeenCalled();
    });

    it('should create new policy if one does not exist', async () => {
      const policyDto: ProductPolicyDto = {
        productId: 1,
        userId: 'user-id',
        price: 15,
      };

      const user = { _id: 'user-id' };
      mockUserModel.findById.mockResolvedValue(user);

      mockProductPolicyModel.findOne.mockResolvedValue(null);

      // Mock the constructor and save method
      const mockSave = jest.fn().mockResolvedValue({
        productId: 1,
        userId: 'user-id',
        price: 15,
        hidden: false,
      });

      jest
        .spyOn(mockProductPolicyModel, 'constructor')
        .mockImplementation(() => ({
          save: mockSave,
        }));

      const result = await service.setPolicy(policyDto);

      expect(result).toEqual({
        productId: 1,
        userId: 'user-id',
        price: 15,
        hidden: false,
      });
    });
  });
});
