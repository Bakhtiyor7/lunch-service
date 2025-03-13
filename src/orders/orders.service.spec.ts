import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getModelToken } from '@nestjs/mongoose';
import { Order } from './schema/order.schema';
import { ProductPolicy } from '../product/schema/product-policy.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { BadRequestException, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

const mockOrderModel = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockProductPolicyModel = {
  find: jest.fn(),
};

const mockHttpService = {
  get: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: getModelToken(ProductPolicy.name),
          useValue: mockProductPolicyModel,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order with valid items', async () => {
      // Mock data
      const userId = 'user-id';
      const createOrderDto: CreateOrderDto = {
        deliveryDate: '2023-07-01',
        comment: 'Test comment',
        items: [
          {
            productId: 1,
            quantity: 2,
          },
        ],
      };

      // Mock API response
      const mockProducts = {
        data: {
          data: [
            { id: 1, name: 'Product 1', price: 10 },
            { id: 2, name: 'Product 2', price: 20 },
          ],
        },
      };

      // Mock policies
      const mockPolicies = [{ productId: 1, price: 15, hidden: false }];

      // Mock responses
      mockHttpService.get.mockReturnValue(of(mockProducts));
      mockProductPolicyModel.find.mockResolvedValue(mockPolicies);

      const savedOrder = {
        userId,
        deliveryDate: new Date('2023-07-01'),
        comment: 'Test comment',
        items: [
          {
            productId: 1,
            productName: 'Product 1',
            quantity: 2,
            amount: 30, // 2 * 15 (custom price)
          },
        ],
        totalAmount: 30,
      };

      mockOrderModel.save = jest.fn().mockResolvedValue(savedOrder);

      // Mock the constructor and save method
      const mockSave = jest.fn().mockResolvedValue(savedOrder);
      jest.spyOn(mockOrderModel, 'constructor').mockImplementation(() => ({
        save: mockSave,
      }));

      // Execute
      const result = await service.createOrder(userId, createOrderDto);

      // Assert
      expect(result).toEqual(savedOrder);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://recruit-dev.lunchlab.me/v1/products',
      );
      expect(mockProductPolicyModel.find).toHaveBeenCalledWith({ userId });
    });

    it('should throw BadRequestException if product is not available', async () => {
      // Mock data
      const userId = 'user-id';
      const createOrderDto: CreateOrderDto = {
        deliveryDate: '2023-07-01',
        items: [
          {
            productId: 1,
            quantity: 2,
          },
        ],
      };

      // Mock API response
      const mockProducts = {
        data: {
          data: [{ id: 1, name: 'Product 1', price: 10 }],
        },
      };

      // Mock policies - product is hidden
      const mockPolicies = [{ productId: 1, price: 15, hidden: true }];

      // Mock responses
      mockHttpService.get.mockReturnValue(of(mockProducts));
      mockProductPolicyModel.find.mockResolvedValue(mockPolicies);

      // Execute & Assert
      await expect(service.createOrder(userId, createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if product not found', async () => {
      // Mock data
      const userId = 'user-id';
      const createOrderDto: CreateOrderDto = {
        deliveryDate: '2023-07-01',
        items: [
          {
            productId: 999, // Non-existent product
            quantity: 2,
          },
        ],
      };

      // Mock API response - doesn't include product 999
      const mockProducts = {
        data: {
          data: [{ id: 1, name: 'Product 1', price: 10 }],
        },
      };

      // Mock responses
      mockHttpService.get.mockReturnValue(of(mockProducts));
      mockProductPolicyModel.find.mockResolvedValue([]);

      // Execute & Assert
      await expect(service.createOrder(userId, createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle API errors gracefully', async () => {
      // Mock data
      const userId = 'user-id';
      const createOrderDto: CreateOrderDto = {
        deliveryDate: '2023-07-01',
        items: [
          {
            productId: 1,
            quantity: 2,
          },
        ],
      };

      // Mock API error
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('API error')),
      );

      // Execute & Assert
      await expect(service.createOrder(userId, createOrderDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getOrderByDeliveryDate', () => {
    it('should return an order for a specific delivery date', async () => {
      // Mock data
      const userId = 'user-id';
      const deliveryDate = '2023-07-01';

      const mockOrder = {
        userId,
        deliveryDate: new Date('2023-07-01'),
        items: [
          {
            productId: 1,
            productName: 'Product 1',
            quantity: 2,
            amount: 30,
          },
        ],
        totalAmount: 30,
      };

      // Mock response
      mockOrderModel.findOne.mockResolvedValue(mockOrder);

      // Execute
      const result = await service.getOrderByDeliveryDate(userId, deliveryDate);

      // Assert
      expect(result).toEqual(mockOrder);
      expect(mockOrderModel.findOne).toHaveBeenCalledWith({
        userId,
        deliveryDate: {
          $gte: expect.any(Date),
          $lte: expect.any(Date),
        },
      });
    });

    it('should throw BadRequestException if order not found', async () => {
      // Mock data
      const userId = 'user-id';
      const deliveryDate = '2023-07-01';

      // Mock response - no order found
      mockOrderModel.findOne.mockResolvedValue(null);

      // Execute & Assert
      await expect(
        service.getOrderByDeliveryDate(userId, deliveryDate),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid delivery date', async () => {
      // Mock data
      const userId = 'user-id';
      const deliveryDate = 'invalid-date';

      // Execute & Assert
      await expect(
        service.getOrderByDeliveryDate(userId, deliveryDate),
      ).rejects.toThrow(BadRequestException);

      // The findOne method should not be called with invalid date
      expect(mockOrderModel.findOne).not.toHaveBeenCalled();
    });
  });
});
