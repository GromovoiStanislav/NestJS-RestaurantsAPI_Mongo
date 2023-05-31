import { Module } from "@nestjs/common";
import { RestaurantsModule } from "./restaurants/restaurants.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { MealModule } from "./meal/meal.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    RestaurantsModule,
    AuthModule,
    MealModule
  ],
})
export class AppModule {
}
