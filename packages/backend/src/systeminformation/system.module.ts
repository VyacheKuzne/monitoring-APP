import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SystemService } from './system.service';
import { RecordStatsService } from './recordStats.service';
import { SystemController } from './system.controller';

@Module({
  imports: [HttpModule],
  providers: [SystemService, RecordStatsService],
  controllers: [SystemController],
})
export class SystemModule {}
