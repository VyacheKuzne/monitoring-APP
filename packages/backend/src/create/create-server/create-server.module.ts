import { Server } from './interfaces/server';
import { Module } from '@nestjs/common';
import { ServerService } from './create-server.service';
import { ServerController } from './create-server.controller';
import { HttpModule } from '@nestjs/axios'; // Импортируем HttpModule
@Module({
  imports: [HttpModule], 
  controllers: [ServerController],
  providers: [ServerService],
})
export class CreateServerModule {}
