import {
  Controller,
  Post,
  UseGuards,
  Request,
  Logger,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ProductService } from './product.service';
import { ServiceException } from 'src/error/serviceException.error';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productsService: ProductService) {}

  private readonly logger = new Logger(ProductController.name);

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product list with user-specific pricing' })
  @ApiResponse({ status: 200, description: 'Returns product list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProducts(@Request() req) {
    try {
      return this.productsService.getProducts(req?.user?.id);
    } catch (error: any) {
      this.logger.error(
        `Error in getProducts ProductController: ${error?.message}`,
      );
      if (!(error instanceof ServiceException)) {
        throw new InternalServerErrorException(error?.message);
      } else {
        throw new HttpException(error.message, error.errorCode);
      }
    } finally {
      this.logger.log('Request completed for getProducts ProductController');
    }
  }
}
