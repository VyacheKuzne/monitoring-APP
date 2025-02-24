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
                    urlPage: pageData.urlPage,
                    statusLoadPage: pageData.statusLoadPage,
                    statusLoadContent: pageData.statusLoadContent,
                    statusLoadDOM: pageData.statusLoadDOM,
                    statusLoadMedia: pageData.mediaStatus,
                    statusLoadStyles: pageData.styleStatus,
                    statusLoadScripts: pageData.scriptStatus,
                    requestTime: parseFloat(pageData.requestTime),
                    responseTime: parseFloat(pageData.responseTime),
                    responseRate: parseFloat(pageData.responseRate),

                    date: new Date(),
                },
            });

            this.logger.log(`Page data recorded successfully`);
            return result;
        }
        else
        {
            this.logger.error('Page data recording error');
            return;
        }
    }
}
