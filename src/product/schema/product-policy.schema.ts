import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class ProductPolicy extends Document {
  @Prop({ required: true })
  productId: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: Number, default: null })
  price: number | null;

  @Prop({ type: Boolean, default: false })
  hidden: boolean;
}

export const ProductPolicySchema = SchemaFactory.createForClass(ProductPolicy);
