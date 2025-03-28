import { Server } from './interfaces/server';
import { Module } from '@nestjs/common';
import { ServerService } from './create-server.service';
import { ServerController } from './create-server.controller';
import { HttpModule } from '@nestjs/axios'; // Импортируем HttpModule
import { RecordedIpService } from './recordedIP.service';
@Module({
  imports: [HttpModule],
  controllers: [ServerController],
  providers: [ServerService, RecordedIpService],
})
export class CreateServerModule {}
