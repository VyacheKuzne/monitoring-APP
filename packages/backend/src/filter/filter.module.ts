import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FilterServerStatusService } from './filterServerStatus.service';
import { FilterController } from './filter.controller';

@Module({
  imports: [HttpModule],
  providers: [FilterServerStatusService],
  controllers: [FilterController],
})
export class FilterModule {}
