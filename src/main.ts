import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { mkdir } from 'fs';
import { swaggerDescription } from './constants/constants';

async function bootstrap() {
  mkdir(`${process.cwd()}/files`, ()=> {});
  
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('1inch Hardware Wallet test task')
    .setDescription(swaggerDescription)
    .addServer(`${process.env.DOMAIN}${process.env.APP_PORT}`)
    .addApiKey({type: 'apiKey', name: 'X-API-KEY', in: 'header'}, 'access-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.useGlobalPipes(
    new ValidationPipe({
      skipNullProperties: true,
      skipUndefinedProperties: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,DELETE',
    credentials: true,
  });
  SwaggerModule.setup(process.env.SWAGGER_PATH, app, document);
  await app.listen(process.env.APP_PORT);
}

bootstrap();
