import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  // ensure all endpoints are being validated
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // setup Swagger
  const config = new DocumentBuilder()
    .setTitle('PrioritAIzeMe')
    .setDescription('A an app that lets users create, read, update and delete tasks and prioritize them.')
    .setVersion('0.0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // set to listen on port 3000
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
