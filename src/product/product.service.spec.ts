import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { HttpService } from '@nestjs/axios';
import { getModelToken } from '@nestjs/mongoose';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ProductPolicy } from './schema/product-policy.schema';

const mockHttpService = {
  get: jest.fn(),
};

const mockProductPolicyModel = {
  find: jest.fn(),
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: HttpService, useValue: mockHttpService },
        {
          provide: getModelToken(ProductPolicy.name),
          useValue: mockProductPolicyModel,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProducts', () => {
    it('should return filtered products based on user policies', async () => {
      // Mock API response
      const mockApiProducts = {
        data: {
          data: [
            { id: '1', name: 'Product 1', price: 10 },
            { id: '2', name: 'Product 2', price: 20 },
            { id: '3', name: 'Product 3', price: 30 },
          ],
        },
      };

      // Mock user policies
      const mockPolicies = [
        { productId: '1', price: 15, hidden: false },
        { productId: '2', hidden: true },
        { productId: '3', price: null, hidden: false },
      ];

      mockHttpService.get.mockReturnValue(of(mockApiProducts));
      mockProductPolicyModel.find.mockResolvedValue(mockPolicies);

      const result = await service.getProducts('user123');

      // Should only return products 1 and 3 (product 2 is hidden)
      expect(result).toHaveLength(2);

      // Product 1 should have custom price
      expect(result).toContainEqual(
        expect.objectContaining({ id: '1', price: 15 }),
      );

      // Product 3 should have original price
      expect(result).toContainEqual(
        expect.objectContaining({ id: '3', price: 30 }),
      );

      // Product 2 should be filtered out (hidden)
      expect(result).not.toContainEqual(expect.objectContaining({ id: '2' }));

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://recruit-dev.lunchlab.me/v1/products',
      );
      expect(mockProductPolicyModel.find).toHaveBeenCalledWith({
        userId: 'user123',
      });
    });

    it('should handle API errors gracefully', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('API error')),
      );

      await expect(service.getProducts('user123')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
