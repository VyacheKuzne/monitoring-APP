import { Module } from '@nestjs/common';
import { DomainService } from './createDomain.service';
import { DomainController } from './createDomain.controller';
import { HttpModule } from '@nestjs/axios'; // Импортируем HttpModule
@Module({
  imports: [HttpModule],  // Добавляем HttpModule в imports
  controllers: [DomainController],
  providers: [DomainService],
})
export class DomainModule {}
