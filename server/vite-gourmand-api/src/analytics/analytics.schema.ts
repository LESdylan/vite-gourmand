// Define the structure of our MongoDB douments using Mongoose

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class MenuStats extends Document {
  @Prop()
  menuId: number;

  @Prop()
  ordersCount: number;

  @Prop()
  revenue: number;
}

export const MenuStatsSchema = SchemaFactory.createForClass(MenuStats);
