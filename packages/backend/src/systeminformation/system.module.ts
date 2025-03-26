import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SystemService } from './system.service';
import { RecordStatsService } from './recordStats.service';
import { SystemController } from './system.controller';
import { SystemStatusService } from './systemStatus.service';

@Module({
  imports: [HttpModule],
  providers: [SystemService, RecordStatsService, SystemStatusService],
  controllers: [SystemController],
})
export class SystemModule {}
