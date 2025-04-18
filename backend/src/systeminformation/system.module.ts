import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SystemService } from './system.service';
import { RecordStatsService } from './recordStats.service';
import { SystemController } from './system.controller';
import { SystemStatusService } from './systemStatus.service';
import { NotificationService } from '../create/create-notification/createNotification.service';

@Module({
  imports: [HttpModule],
  providers: [SystemService, RecordStatsService, SystemStatusService, NotificationService],
  controllers: [SystemController],
})
export class SystemModule {}
