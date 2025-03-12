import {
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ServiceException } from 'src/error/serviceException.error';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto) {
    try {
      const user = await this.authService.signup(body);
      return user;
    } catch (error: any) {
      this.logger.error(
        `Error in createUser AuthController: ${error?.message}`,
      );
      if (!(error instanceof ServiceException)) {
        throw new InternalServerErrorException(error?.message);
      } else {
        throw new HttpException(error.message, error.errorCode);
      }
    } finally {
      this.logger.log('Request completed for createUser AuthController');
    }
  }

  @Post('/login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async signin(@Body() body: LoginDto) {
    try {
      const user = await this.authService.signin(body);
      return user;
    } catch (error: any) {
      this.logger.error(`Error in signin AuthController: ${error?.message}`);
      if (!(error instanceof ServiceException)) {
        throw new InternalServerErrorException(error?.message);
      } else {
        throw new HttpException(error.message, error.errorCode);
      }
    } finally {
      this.logger.log('Request completed for signin AuthController');
    }
  }
}
