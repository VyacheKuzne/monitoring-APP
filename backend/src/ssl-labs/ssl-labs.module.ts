// src/ssl-labs/ssl-labs.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SslLabsController } from './ssl-labs.controller';
import { SslLabsService } from './ssl-labs.service';

@Module({
  imports: [HttpModule],
  controllers: [SslLabsController],
  providers: [SslLabsService],
  exports: [SslLabsService], // Экспортируем сервис, если он нужен в других модулях
})
export class SslLabsModule {}