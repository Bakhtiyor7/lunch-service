import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/user/schema/user.schema';

class OrderItem {
  @Prop({ required: true })
  productId: number;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  amount: number;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  deliveryDate: Date;

  @Prop()
  comment: string;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ type: [Object], required: true })
  items: OrderItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
