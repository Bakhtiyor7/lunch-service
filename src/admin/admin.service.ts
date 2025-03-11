import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductPolicyDto } from 'src/product/dto/product-policy.dto';
import { ProductPolicy } from 'src/product/schema/product-policy.schema';
import { User } from 'src/user/schema/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(ProductPolicy.name)
    private productPolicyModel: Model<ProductPolicy>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async setPolicy(policyDto: ProductPolicyDto): Promise<ProductPolicy> {
    const { productId, userId, price, hidden } = policyDto;

    if (price === undefined && hidden === undefined) {
      throw new BadRequestException('At least one should be provided!!!');
    }

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // check if policy already exists !!!!!!
    const policyDoesExist = await this.productPolicyModel.findOne({
      productId,
      userId: user._id,
    });

    if (policyDoesExist) {
      if (price !== undefined) policyDoesExist.price = price;
      if (hidden !== undefined) policyDoesExist.hidden = hidden;
      return policyDoesExist.save();
    } else {
      const newPolicy = new this.productPolicyModel({
        productId,
        userId: user._id,
        price: price !== undefined ? price : null,
        hidden: hidden !== undefined ? hidden : false,
      });
      // save to DB !!!
      return newPolicy.save();
    }
  }
}
