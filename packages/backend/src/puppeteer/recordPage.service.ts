import { Injectable, Logger} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PageData } from './page.interface';

@Injectable()
export class RecordPageService {

    private prisma = new PrismaClient();
    private readonly logger = new Logger(RecordPageService.name);

    async recordPage(pageData: PageData) {

        if (pageData)
        {
            const result = await this.prisma.checkPage.create({
                data: {
                    statusLoadPage: pageData.statusLoadPage,
                    statusLoadContent: pageData.statusLoadContent,
                    statusLoadDOM: pageData.statusLoadDOM,
                    statusLoadMedia: pageData.mediaStatus, // Обновите на правильное имя, если нужно
                    statusLoadStyles: pageData.styleStatus, // Обновите на правильное имя, если нужно
                    statusLoadScripts: pageData.scriptStatus, // Обновите на правильное имя, если нужно
                    requestTime: parseFloat(pageData.requestTime), // Конвертируем в float
                    responseTime: parseFloat(pageData.responseTime), // Конвертируем в float
                    responseRate: parseFloat(pageData.responseRate),

                    date: new Date(),
                },
            });

            this.logger.log(`Page loaded correctly`);
            return result;
        }
        else
        {
            this.logger.error('Page load error');
            return;
        }
    }
}
