// src/app.module.ts (ensure 'http' module is installed: npm install @nestjs/platform-express)
import { Module } from '@nestjs/common';
import { testDBController } from './testDB.controller';
import { testDBService } from './testDB.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [testDBController],
  providers: [testDBService],
})
export class testDBModule {}

// React Frontend
