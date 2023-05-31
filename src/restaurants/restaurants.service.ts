import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Query } from "express-serve-static-core";
import * as mongoose from "mongoose";
import { User } from "../auth/schemas/user.schema";
import APIFeatures from "../utils/apiFeatures.utils";
import { Restaurant } from "./schemas/restaurant.schema";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";

@Injectable()
export class RestaurantsService {

  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: mongoose.Model<Restaurant>,
  ) {}


  // Get all Restaurants  =>  GET  /restaurants
  async findAll(query: Query): Promise<Restaurant[]> {
    const resPerPage = 3;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);


    const keyword = query.keyword
      ? {
          name: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};

    return this.restaurantModel
      .find({ ...keyword })
      .limit(resPerPage)
      .skip(skip);
  }


  // Create new Restaurant  =>  POST  /restaurants
  async create(restaurant: CreateRestaurantDto, user: User): Promise<Restaurant> {
    const data = Object.assign(restaurant, { user: user._id });
    return await this.restaurantModel.create(data);
  }


  // Get a restaurant by ID  =>  GET  /restaurants/:id
  async findById(id: string): Promise<Restaurant> {
    const isValidId = mongoose.isValidObjectId(id);
    if (!isValidId) {
      throw new BadRequestException('Wrong mongoose ID Error. Please enter correct ID.',);
    }

    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found.');
    }

    return restaurant;
  }


  // Update a restaurant by ID  =>  PUT  /restaurants/:id
  async updateById(id: string, restaurant: UpdateRestaurantDto): Promise<Restaurant> {
    return this.restaurantModel.findByIdAndUpdate(id, restaurant, {
      new: true,
      runValidators: true,
    });
  }


  // Delete a restaurant by ID  =>  DELETE  /restaurants/:id
  async deleteById(id: string): Promise<Restaurant> {
    return this.restaurantModel.findByIdAndDelete(id);
  }


  // Upload Images  =>  PUT /restaurants/upload/:id
  async uploadImages(id: string, files) {
    //const images = await APIFeatures.upload(files);
    const images = await APIFeatures.uploadLocal(files);

    return this.restaurantModel.findByIdAndUpdate(id, { images: images as Object[], }, {
        new: true,
        runValidators: true,
      },
    );
  }


  async deleteImages(images) {
    if (images.length === 0) return true;
    //return APIFeatures.deleteImages(images);
    return APIFeatures.deleteImagesLocal(images);
  }

}
