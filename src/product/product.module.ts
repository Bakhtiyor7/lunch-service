import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';

import { ProductController } from './product.controller';
import {
  ProductPolicy,
  ProductPolicySchema,
} from './schema/product-policy.schema';
import { ProductService } from './product.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductPolicy.name, schema: ProductPolicySchema },
    ]),
    HttpModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], // Export if needed by other modules
})
export class ProductModule {}
