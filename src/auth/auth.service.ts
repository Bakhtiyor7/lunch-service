import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { CreateUserDto } from './dto/create-user.dto';
const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async signup(user: CreateUserDto) {
    const { username, password, name, phone, company } = user;
    const existingUser = await this.userService.find(username);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    const newUser = await this.userService.create({
      username,
      password: result,
      name,
      phone,
      company,
    });

    return newUser;
  }

  async signin(user: CreateUserDto) {
    const existingUser = await this.userService.find(user.username);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(user.password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Wrong credentials');
    }

    return existingUser;
  }
}
