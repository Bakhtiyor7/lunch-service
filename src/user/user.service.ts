import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async find(username: string) {
    return this.userModel.findOne({ username });
  }

  async create(user: CreateUserDto) {
    const newUser = new this.userModel(user);
    return newUser.save();
  }
}
