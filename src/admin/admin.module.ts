import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductPolicy,
  ProductPolicySchema,
} from 'src/products/schema/product-policy.schema';
import { UserModule } from 'src/user/user.module';
import { User, UserSchema } from 'src/user/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductPolicy.name, schema: ProductPolicySchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
