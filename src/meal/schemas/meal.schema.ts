import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { Document } from "mongoose";

export enum Category {
  SOUPS = 'Soups',
  SALADS = 'Salads',
  SANDWICHES = 'Sandwiches',
  PIZZA = 'Pizza',
  PASTA = 'Pasta',
}

@Schema({ timestamps: true, })
export class Meal extends Document  {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  price: number;

  @Prop()
  category: Category;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' })
  restaurant: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}

export const MealSchema = SchemaFactory.createForClass(Meal);
