import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Query as ExpressQuery } from "express-serve-static-core";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User, UserRoles } from "../auth/schemas/user.schema";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";
import { RestaurantsService } from "./restaurants.service";
import { Restaurant } from "./schemas/restaurant.schema";
import { Roles } from "../auth/decorators/roles.decorator";


@Controller("restaurants")
export class RestaurantsController {

  constructor(
    private restaurantsService: RestaurantsService
  ) {
  }


  // Get all Restaurants  =>  GET  /restaurants
  @Get()
  async getAllRestaurants(@Query() query: ExpressQuery): Promise<Restaurant[]> {
    return this.restaurantsService.findAll(query);
  }


  // Get a restaurant by ID  =>  GET  /restaurants/:id
  @Get(":id")
  async getRestaurant(@Param("id") id: string): Promise<Restaurant> {
    return this.restaurantsService.findById(id);
  }


  // Create new Restaurant  =>  POST  /restaurants
  @Post()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles("admin", "user")
  async createRestaurant(
    @Body() restaurant: CreateRestaurantDto,
    @CurrentUser() user: User
  ): Promise<Restaurant> {
    return this.restaurantsService.create(restaurant, user);
  }


  // Update a restaurant by ID  =>  PUT  /restaurants/:id
  @Put(":id")
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles("admin", "user")
  async updateRestaurant(
    @Param("id") id: string,
    @Body() updateDto: UpdateRestaurantDto,
    @CurrentUser() user: User
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantsService.findById(id);

    if (user.role !== UserRoles.ADMIN && restaurant.user.toString() !== user._id.toString()) {
      throw new ForbiddenException("You can not update this restaurant.");
    }

    return this.restaurantsService.updateById(id, updateDto);
  }


  // Delete a restaurant by ID  =>  DELETE  /restaurants/:id
  @Delete(":id")
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles("admin", "user")
  async deleteRestaurant(
    @Param("id") id: string,
    @CurrentUser() user: User
  ): Promise<{ deleted: Boolean }> {
    const restaurant = await this.restaurantsService.findById(id);

    if (user.role !== UserRoles.ADMIN && restaurant.user.toString() !== user._id.toString()) {
      throw new ForbiddenException("You can not delete this restaurant.");
    }

    const isDeleted = await this.restaurantsService.deleteImages(restaurant.images);

    if (isDeleted) {
      await this.restaurantsService.deleteById(id);
      return { deleted: true };
    }
    return { deleted: false };

  }


  // Upload Images  =>  PUT /restaurants/upload/:id
  @Put("upload/:id")
  @UseGuards(AuthGuard())
  @UseInterceptors(FilesInterceptor("files"))
  async uploadFiles(
    @Param("id") id: string,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    await this.restaurantsService.findById(id);
    return this.restaurantsService.uploadImages(id, files);
  }

}
