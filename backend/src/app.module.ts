// src/app.module.ts (ensure 'http' module is installed: npm install @nestjs/platform-express)
import { Module } from '@nestjs/common';
import { AppControlleeer, AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AppControlleeer, AppController],
  providers: [AppService],
})
export class AppModule {}

// React Frontend
