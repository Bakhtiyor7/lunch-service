import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ProductService } from './product.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productsService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product list with user-specific pricing' })
  @ApiResponse({ status: 200, description: 'Returns product list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProducts(@Request() req) {
    return this.productsService.getProducts(req?.user?.id);
  }
}
