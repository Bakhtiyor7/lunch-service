import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(user: CreateUserDto) {
    const { username, password, name, phone, company } = user;

    const existingUser = await this.userService.find(username);
    if (existingUser) {
      throw new Error('User already exists'); // TODO: replace with ConflictException
    }
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hashedPwd = salt + '.' + hash.toString('hex');

    const newUser = await this.userService.create({
      username,
      password: hashedPwd,
      name,
      phone,
      company,
    });

    return newUser;
  }

  async signin(loginDto: LoginDto) {
    const user = await this.userService.find(loginDto.username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(loginDto.password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new UnauthorizedException('Wrong credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const payload = { id: user.id, username: user.username };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }
}
