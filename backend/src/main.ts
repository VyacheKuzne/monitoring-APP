import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001', // Разрешаем запросы только с этого домена
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Разрешаем указанные HTTP-методы
    credentials: true, // Разрешаем отправку куки (если необходимо)
  });
  await app.listen(3000);
}
bootstrap();