import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { RecordStatsService } from './recordStats.service';
import { SystemController } from './system.controller';

@Module({
  providers: [SystemService, RecordStatsService],
  controllers: [SystemController],
})
export class SystemModule {}