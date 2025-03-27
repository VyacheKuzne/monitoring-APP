import { Module } from '@nestjs/common';
import { DomainService } from './createDomain.service';
import { DomainController } from './createDomain.controller';
import { ProgressGateway } from './progress.gateway';
import { HttpModule } from '@nestjs/axios';
import { NotificationService } from '../create-notification/createNotification.service';
import { CreateNotificationModule } from '../create-notification/createNotification.module';
@Module({
  imports: [HttpModule, CreateNotificationModule],
  controllers: [DomainController],
  providers: [DomainService, ProgressGateway, NotificationService],
})
export class DomainModule {}
