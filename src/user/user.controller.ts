import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AdminGuard } from 'src/guards/admin-guard';

@ApiTags('User')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private readonly logger = new Logger(UserController.name);

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users found' })
  @ApiResponse({ status: 404, description: 'Users not found' })
  async getAllUsers() {
    try {
      this.logger.log('Entering getAllUsers UserController method');
      return await this.userService.findAll();
    } catch (error) {
      this.logger.error(
        `Error in getAllUsers UserController method: ${error?.message}`,
      );
      throw new InternalServerErrorException(error?.message);
    }
  }

  //get user by id
  @Get()
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Request() req) {
    try {
      this.logger.log('Entering getUser UserController method');
      return await this.userService.find(req.user.username);
    } catch (error) {
      this.logger.error(`Error in getUser UserController: ${error?.message}`);
      throw new InternalServerErrorException(error?.message);
    }
  }
}
