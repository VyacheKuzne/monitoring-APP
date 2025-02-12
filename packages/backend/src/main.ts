import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { testDBModule } from './testDB/testDB.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const test = await NestFactory.create(testDBModule);
  app.enableCors({
    origin: 'http://localhost:3001', // Разрешает запросы с React
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
