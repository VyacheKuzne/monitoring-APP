import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PageStatusService {
  constructor(private readonly httpService: HttpService) {}

  private prisma = new PrismaClient();
  private readonly logger = new Logger(PageStatusService.name);

    async getPageStatus(idApp: number) {

        const pages = await this.prisma.checkPage.findMany({
            where: {
                parentApp: idApp,
                date: {
                    gte: new Date(Date.now() - 60 * 60 * 1000)
                }
            },
        });

        let okay = 0;
        let notOkay = 0;

        pages.map((page) => {
            page.statusLoadPage === '200' ? okay++ : notOkay++;
        })

        const totalCount = okay + notOkay;
        const status: boolean = (notOkay / totalCount) < 0.5 ? true : false;

        return status;
    }
}
