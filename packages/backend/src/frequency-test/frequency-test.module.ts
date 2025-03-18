import { Module } from '@nestjs/common';
import { FrequencyTestController } from './frequency-test.controller';
import { FrequencyTestService } from './frequency-test.service';
import { HttpModule } from '@nestjs/axios'; // Импортируем HttpModule
import { ScheduleModule } from '@nestjs/schedule'; // Импортируем ScheduleModule

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()], // Подключаем ScheduleModule здесь
  controllers: [FrequencyTestController],
  providers: [FrequencyTestService],
})
export class FrequencyTestModule {}
