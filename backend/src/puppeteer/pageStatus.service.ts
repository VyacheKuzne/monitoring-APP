import { Injectable, Logger } from '@nestjs/common';
import prisma from '../../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PageStatusService {
  constructor(private readonly httpService: HttpService) {}

  private prisma = prisma;
  private readonly logger = new Logger(PageStatusService.name);

  async getPageStatus(idApp: number) {
    const pages = await this.prisma.page.findMany({
        where: {
          parentApp: idApp,
        },
        select: {
          idPage: true,
          checkPage: {
            where: {
              date: {
                gte: new Date(Date.now() - 60 * 60 * 1000),
              },
            },
          },
        },
      });

    let okay = 0;
    let notOkay = 0;

    pages.forEach((page) => {
        page.checkPage.forEach((check) => {
            check.statusLoadPage === "200" ? okay++ : notOkay++;
        });
    });

    const totalCount = okay + notOkay;
    const status: boolean = notOkay / totalCount < 0.5 ? true : false;

    return status;
  }
}
