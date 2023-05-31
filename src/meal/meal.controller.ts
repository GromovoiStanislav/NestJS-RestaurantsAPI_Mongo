import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRoles } from "../auth/schemas/user.schema";
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { MealService } from './meal.service';
import { Meal } from './schemas/meal.schema';
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller('meals')
export class MealController {

  constructor(
    private mealService: MealService
  ) {}


  // Get all meals  =>  GET  /meals
  @Get()
  async getAllMeals(): Promise<Meal[]> {
    return this.mealService.findAll();
  }


  // Get a meal with ID  =>  GET  /meals/:id
  @Get(':id')
  async getMeal(@Param('id') id: string): Promise<Meal> {
    return this.mealService.findById(id);
  }


  // Get all meals of restaurant  =>  GET  /meals/:restaurant
  @Get('restaurant/:id')
  async getMealsByRestaurant(@Param('id') id: string): Promise<Meal[]> {
    return this.mealService.findByRestaurant(id);
  }


  // Create a new meal  =>  POST  /meals/restaurant
  @Post()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles("admin", "user")
  createMeal(
    @Body() createMealDto: CreateMealDto,
    @CurrentUser() user: User,
  ): Promise<Meal> {
    return this.mealService.create(createMealDto, user);
  }


  // Update meal  =>  PUT  /meals/:id
  @Put(':id')
  @UseGuards(AuthGuard())
  async updateMeal(
    @Body() updateMealDto: UpdateMealDto,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Meal> {
    const meal = await this.mealService.findById(id);

    if (user.role !== UserRoles.ADMIN && meal.user.toString() !== user._id.toString()) {
      throw new ForbiddenException('You can not update this meal.');
    }

    return this.mealService.updateById(id, updateMealDto);
  }


  // Delete meal by Id  =>  DELETE /meals/:id
  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteMeal(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<{ deleted: Boolean }> {
    const meal = await this.mealService.findById(id);

    if (user.role !== UserRoles.ADMIN && meal.user.toString() !== user._id.toString()) {
      throw new ForbiddenException('You can not delete this meal.');
    }

    return this.mealService.deleteById(id);
  }

}
