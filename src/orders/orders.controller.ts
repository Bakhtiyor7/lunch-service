import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  Logger,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ServiceException } from '../error/serviceException.error';

interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
    isAdmin: boolean;
  };
}

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  private readonly logger = new Logger(OrdersController.name);

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createOrder(
    @Request() req: RequestWithUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    try {
      this.logger.log('Entering createOrder OrdersController method');
      return this.ordersService.createOrder(req.user.id, createOrderDto);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      this.logger.error(
        `Error in createOrder OrdersController: ${errorMessage}`,
      );
      if (!(error instanceof ServiceException)) {
        throw new InternalServerErrorException(errorMessage);
      } else {
        throw new HttpException(errorMessage, error.errorCode);
      }
    } finally {
      this.logger.log('Request completed for createOrder OrdersController');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by delivery date' })
  @ApiResponse({ status: 200, description: 'Returns order details' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'deliveryDate',
    required: true,
    description: 'Delivery date in YYYY-MM-DD format',
    example: '2025-03-11',
    type: String,
  })
  async getOrder(
    @Request() req: RequestWithUser,
    @Query('deliveryDate') deliveryDate: string,
  ) {
    try {
      this.logger.log('Entering getOrder OrdersController method');
      return this.ordersService.getOrderByDeliveryDate(
        req.user.id,
        deliveryDate,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      this.logger.error(`Error in getOrder OrdersController: ${errorMessage}`);
      if (!(error instanceof ServiceException)) {
        throw new InternalServerErrorException(errorMessage);
      } else {
        throw new HttpException(errorMessage, error.errorCode);
      }
    } finally {
      this.logger.log('Request completed for getOrder OrdersController');
    }
  }
}
