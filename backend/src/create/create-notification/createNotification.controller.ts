import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './createNotification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('create')
  async createNotification(@Body() data: any) {
    return this.notificationService.createNotification(data);
  }
}
