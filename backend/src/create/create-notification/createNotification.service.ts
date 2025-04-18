import { Injectable, Logger } from '@nestjs/common';
import prisma from '../../../prisma/prisma.service';
import { NotificationData } from './notification';
import { Bot } from 'grammy';
import 'dotenv/config';

@Injectable()
export class NotificationService {
  private prisma = prisma;
  private readonly logger = new Logger(NotificationService.name);
  private bot: Bot;

  private token = process.env.BOT_TOKEN;
  private chatId: string = '-1002669317559';

  constructor() {
    if (!process.env.BOT_TOKEN) {
      throw new Error('BOT_TOKEN is not defined');
    }
    this.token = process.env.BOT_TOKEN;
    this.bot = new Bot(this.token);
  }

  async createNotification(notificationData: NotificationData) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          text: notificationData.text,
          parentCompany: notificationData.parentCompany,
          parentServer: notificationData.parentServer,
          parentApp: notificationData.parentApp,
          status: notificationData.status,
          date: notificationData.date,
        },
      });
      if (
        notification.status === 'notification' ||
        notification.status === 'warning'
      ) {
        this.logger.debug('пытаемся создать уведомление в телегу')
        this.sendTelegramMessage(this.chatId, notification.text);
      }

      this.logger.log(`Уведомление было успешно созданно`);
    } catch (error) {
      this.logger.error(`Ошибка при попытке создать уведомление`);
    }
  }

  private async sendTelegramMessage(chatId: string, message: string) {
    try {
      await this.bot.api.sendMessage(chatId, message);
      this.logger.log(`Сообщение отправленно в телеграмм`);
    } catch (error) {
      this.logger.error(`Ошибка при поытке отправить сообщение в телеграмм`);
    }
  }
}
