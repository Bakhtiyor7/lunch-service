import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product, ProductApiResponse } from './types/product-interfact';
import { ProductPolicy } from './schema/product-policy.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(ProductPolicy.name)
    private productPolicyModel: Model<ProductPolicy>,
    private readonly httpService: HttpService,
  ) {}

  async getProducts(userId: string) {
    try {
      // fetch from Lunchlab API !!!
      //TODO: refactor api call !!!!!!!!!!!!!!!!!!!!!!!!
      const response = await firstValueFrom(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.httpService
          .get<ProductApiResponse>(
            'https://recruit-dev.lunchlab.me/v1/products',
          )
          .pipe(
            catchError(() => {
              throw new HttpException(
                'Failed to fetch products',
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }),
          ),
      );

      // Extract the products array from the response
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const products = response.data.data;

      // Get user-specific policies
      const policies = await this.productPolicyModel.find({ userId });
      const policyMap = new Map();

      policies.forEach((policy) => {
        policyMap.set(policy.productId, policy);
      });

      // Apply user-specific pricing and visibility
      const filteredProducts = products.filter((product: Product) => {
        const policy = policyMap.get(product.id);

        // Skip hidden products
        if (policy && policy.hidden === true) {
          return false;
        }

        // Apply custom pricing if available
        if (policy && typeof policy.price === 'number') {
          product.price = policy.price;
        }

        return true;
      });

      return filteredProducts;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get products';
      const errorStatus =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(errorMessage, errorStatus);
    }
  }
}
