import { Module } from '@nestjs/common';
import { SslLabsController } from './ssl-labs.controller';
import { SslLabsService } from './ssl-labs.service';
import { HttpModule } from '@nestjs/axios';
import { NotificationService } from '../create/create-notification/createNotification.service';

@Module({
  imports: [HttpModule],
  controllers: [SslLabsController],
  providers: [SslLabsService, NotificationService],
})
export class SslLabsModule {}
