import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger('NestApplication')
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT || 4000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
