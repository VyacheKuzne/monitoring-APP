import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NotificationData } from './notification';
import { Bot } from 'grammy';
import 'dotenv/config'; 

@Injectable()
export class NotificationService {
  private prisma = new PrismaClient();
  private readonly logger = new Logger(NotificationService.name);
  private bot: Bot;

  private token = process.env.BOT_TOKEN;
  private chatId: string = '-1002669317559'
  
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
      if(notification.status === 'alert' || notification.status === 'warning') {
        this.sendTelegramMessage(this.chatId, notification.text);
      }

      this.logger.log(`The notification was created successfully`);
    } 
    catch (error) {
      this.logger.error(`Error when trying to create a notification`);
    }
  }

  private async sendTelegramMessage(chatId: string, message: string) {
    try {
      await this.bot.api.sendMessage(chatId, message);
      this.logger.log(`The message was sent to Telegram`);
    } 
    catch (error) {
      this.logger.error(`Error when sending a message to Telegram`);
    }
  }
}
