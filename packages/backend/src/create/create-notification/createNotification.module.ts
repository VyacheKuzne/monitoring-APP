import { Module } from '@nestjs/common';
import { NotificationService } from './createNotification.service';
import { NotificationController } from './createNotification.controller';
import { HttpModule } from '@nestjs/axios'; // Импортируем HttpModule
@Module({
  imports: [HttpModule], // Добавляем HttpModule в imports
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class CreateNotificationModule {}
