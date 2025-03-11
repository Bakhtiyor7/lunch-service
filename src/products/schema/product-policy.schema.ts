import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/user/schema/user.schema';

@Schema({ timestamps: true })
export class ProductPolicy extends Document {
  @Prop({ required: true })
  productId: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop()
  price: number;

  @Prop({ default: false })
  hidden: boolean;
}

export const ProductPolicySchema = SchemaFactory.createForClass(ProductPolicy);
