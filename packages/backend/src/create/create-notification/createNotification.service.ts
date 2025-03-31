import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NotificationData } from './notification';

@Injectable()
export class NotificationService {
  private prisma = new PrismaClient();
  private readonly logger = new Logger(NotificationService.name);
  constructor() {}

  async createNotification(notificationData: NotificationData) {
    try {
      await this.prisma.notification.create({
        data: {
          text: notificationData.text,
          parentCompany: notificationData.parentCompany,
          parentServer: notificationData.parentServer,
          parentApp: notificationData.parentApp,
          status: notificationData.status,
          date: notificationData.date,
        },
      });
      this.logger.log(`Уведмоление создано успешно`);
    } catch (error) {
      this.logger.error(
        `Ошибка при поптыке создать уведомелние: ${error.message}`,
      );
    }
  }
}
