import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { OrderItem } from '../interfaces/order-item.interface';

@Schema()
class OrderItemSchema {
  @Prop({ required: true })
  productId: number;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  amount: number;
}

const OrderItemSchemaDefinition = SchemaFactory.createForClass(OrderItemSchema);

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

  @Prop({ type: [OrderItemSchemaDefinition], required: true })
  items: OrderItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
