import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Meal } from '../../meal/schemas/meal.schema';
import { User } from '../../auth/schemas/user.schema';
import { Document } from "mongoose";


export enum Category {
  FAST_FOOD = 'Fast Food',
  CAFE = 'Cafe',
  FINE_DINNING = 'Fine Dinning',
}

@Schema({ timestamps: true })
export class Restaurant extends Document {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  email: string;

  @Prop()
  phoneNo: number;

  @Prop()
  address: string;

  @Prop()
  category: Category;

  @Prop()
  images?: string[];//object[]

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }])
  menu?: Meal[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
