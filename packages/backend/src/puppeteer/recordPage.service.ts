import { Injectable, Logger} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class RecordPageService {

    private prisma = new PrismaClient();
    private readonly logger = new Logger(RecordPageService.name);

    async recordPage(pageData: PageData) {

        if (pageData)
        {
            const result = await this.prisma.checkServerStats.create({
                data: {
                statusLoadPage: pageData. ,
                statusLoadContent: pageData. ,
                statusLoadDOM: pageData. ,
                statusLoadMedia: pageData. ,
                statusLoadStyles: pageData. ,
                statusLoadScripts: pageData. ,
                requestTime: pageData. ,
                responseTime: pageData. ,
                responseRate: pageData. ,

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
