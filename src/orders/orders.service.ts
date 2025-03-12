import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schema/order.schema';
import { ProductPolicy } from '../product/schema/product-policy.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  Product,
  ProductApiResponse,
} from '../product/types/product.interface';
import { OrderItem } from './interfaces/order-item.interface';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(ProductPolicy.name)
    private productPolicyModel: Model<ProductPolicy>,
    private readonly httpService: HttpService,
  ) {}

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    try {
      const { deliveryDate, comment, items } = createOrderDto;

      const deliveryDateObj = new Date(deliveryDate);
      if (isNaN(deliveryDateObj.getTime())) {
        throw new BadRequestException('Invalid delivery date');
      }

      const response = await firstValueFrom(
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

      const products: Product[] = response.data.data;
      this.logger.debug(
        `Fetched ${products.length} products from external API`,
      );

      const productMap = new Map<number, Product>();
      products.forEach((product) => {
        productMap.set(product.id, product);
      });

      const policies = await this.productPolicyModel.find({ userId });
      this.logger.debug(
        `Found ${policies.length} product policies for user ${userId}`,
      );

      const policyMap = new Map<number, ProductPolicy>();
      policies.forEach((policy) => {
        policyMap.set(policy.productId, policy);
      });

      // order items and total amount
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const { productId, quantity } = item;

        // fetch product
        const product = productMap.get(productId);
        if (!product) {
          throw new BadRequestException('Product not found');
        }

        const policy = policyMap.get(productId);
        if (policy && policy.hidden) {
          throw new BadRequestException('Product is not available');
        }

        // use default price if there's no policy
        const price =
          policy && policy.price !== null ? policy.price : product.price;

        const amount = price * quantity;
        totalAmount += amount;

        orderItems.push({
          productId,
          productName: product.name,
          quantity,
          amount,
        });
      }

      this.logger.debug(
        `Created orders: ${orderItems.length}, total amount: ${totalAmount}`,
      );

      const newOrder = new this.orderModel({
        userId,
        deliveryDate: deliveryDateObj,
        comment,
        items: orderItems,
        totalAmount,
      });

      return newOrder.save();
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      this.logger.error(`Error creating order: ${errorMessage}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      const statusCode =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(errorMessage, statusCode);
    }
  }

  async getOrderByDeliveryDate(
    userId: string,
    deliveryDate: string,
  ): Promise<Order> {
    try {
      const deliveryDateObj = new Date(deliveryDate);
      if (isNaN(deliveryDateObj.getTime())) {
        throw new BadRequestException('Invalid delivery date');
      }

      deliveryDateObj.setHours(0, 0, 0, 0);

      const endOfDay = new Date(deliveryDateObj);
      endOfDay.setHours(23, 59, 59, 999);

      this.logger.debug(
        `Searching for order with userId ${userId} and deliveryDate ${deliveryDate}`,
      );

      const order = await this.orderModel.findOne({
        userId,
        deliveryDate: {
          $gte: deliveryDateObj,
          $lte: endOfDay,
        },
      });

      if (!order) {
        throw new BadRequestException(
          `No order found for delivery date ${deliveryDate}`,
        );
      }

      return order;
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      this.logger.error(`Error getting order: ${errorMessage}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      const statusCode =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(errorMessage, statusCode);
    }
  }
}
