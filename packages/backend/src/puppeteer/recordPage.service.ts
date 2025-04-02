import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PageData, СheckPageData } from './page.interface';

@Injectable()
export class RecordPageService {
  private prisma = new PrismaClient();
  private readonly logger = new Logger(RecordPageService.name);

  async recordPage(pageData: PageData, checkPageData: СheckPageData) {
    if (checkPageData) {
      const page = await this.prisma.page.upsert({
        where: { urlPage: pageData.urlPage },
        update: { 
          parentApp: pageData.parentApp,
          title: pageData.title,
        },
        create: {
          parentApp: pageData.parentApp,
          title: pageData.title,
          urlPage: pageData.urlPage,
        }
      });

      const checkPage = await this.prisma.checkPage.create({
        data: {
          parentPage: page.idPage,
          statusLoadPage: checkPageData.statusLoadPage,
          statusLoadContent: checkPageData.statusLoadContent,
          statusLoadDOM: checkPageData.statusLoadDOM,
          statusLoadMedia: checkPageData.mediaStatus,
          statusLoadStyles: checkPageData.styleStatus,
          statusLoadScripts: checkPageData.scriptStatus,
          responseTime: parseFloat(checkPageData.responseTime),

          date: new Date(),
        },
      });

      this.logger.log(`Данные успешно сохранены, url: ${pageData.urlPage}`);
      return checkPage;
    } else {
      this.logger.error('Page data recording error');
      return;
    }
  }
}
