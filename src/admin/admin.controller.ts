import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  InternalServerErrorException,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';

import { ServiceException } from 'src/error/serviceException.error';
import { ProductPolicyDto } from 'src/product/dto/product-policy.dto';
import { AdminGuard } from 'src/guards/admin-guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private readonly logger = new Logger(AdminController.name);

  @Post('product-policy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set product policy for a user' })
  @ApiResponse({ status: 200, description: 'Product policy set successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async setProductPolicy(@Body() productPolicyDto: ProductPolicyDto) {
    try {
      this.logger.log('Entering setProductPolicy AdminController method');
      const restult = await this.adminService.setPolicy(productPolicyDto);

      return restult;
    } catch (error) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error in setProductPolicy AdminController: ${error.message}`,
      );
      if (!(error instanceof ServiceException)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        throw new InternalServerErrorException(error.message);
      } else {
        throw new HttpException(error.message, error.errorCode);
      }
    } finally {
      this.logger.log('Request completed for setProductPolicy AdminController');
    }
  }
}
