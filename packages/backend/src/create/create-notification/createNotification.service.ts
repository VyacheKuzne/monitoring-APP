import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';
import { NotificationData } from './notification'
import axios from 'axios';

@Injectable()
export class NotificationService {
  private prisma = new PrismaClient();
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger(NotificationService.name);

  async createNotification(notificationData: NotificationData)
  {
    if(notificationData)
    {
      await this.prisma.notification.create({
        data: {
          text: notificationData.text,
          parentCompany: notificationData.parentCompany,
          parentServer: notificationData.parentServer,
          parentApp: notificationData.parentApp,
          date: new Date(),
        },
      });
      this.logger.log(`Notification recorded`);
    }
    else
    {
      this.logger.error(`Error recording the notification`);
    }
  }

}
