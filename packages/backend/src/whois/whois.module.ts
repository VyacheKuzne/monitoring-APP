import { Module } from '@nestjs/common';
import { WhoisService } from './whois.service';
import { WhoisController } from './whois.controller';
import { HttpModule } from '@nestjs/axios';
import { NotificationService } from '../create/create-notification/createNotification.service';

@Module({
  imports: [HttpModule],
  providers: [WhoisService, NotificationService],
  controllers: [WhoisController],
})
export class WhoisModule {}
