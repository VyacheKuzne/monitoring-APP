// src/app.service.ts
import { Injectable } from '@nestjs/common';
import prisma from '../prisma/prisma.service';

@Injectable()
export class AppService {
  private prisma = prisma;

  async getAllCompanies() {
    return this.prisma.company.findMany();
  }
  async getCompany(idCompany: number) {
    return this.prisma.company.findFirst({
      where: { idCompany: idCompany },
    });
  }

  async getServers(idCompany: number) {
    return this.prisma.server.findMany({
      where: { parentCompany: idCompany },
      // include: {
      //   domain: {
      //     where: {
      //       domain: {
      //         name: ,  // Filter for domain with name 'host'
      //       },
      //     },
      //   },
      // },
    });
  }

  async getServer(numberServer: number, numberCompany: number) {
    return {
      server: await this.prisma.server.findFirst({
        where: { idServer: numberServer },
      }),
      company: await this.prisma.company.findFirst({
        where: { idCompany: numberCompany },
      }),
    };
  }
  // фукнция получить данные о приложениях
  async getApp(numberServer: number) {
    const apps = await this.prisma.app.findMany({
      where: { parentServer: numberServer },
      select: {
        idApp: true,
        name: true,
        domain: {
          select: {
            name: true,
            expires: true,
            SSL: {
              select: {
                expires: true,
              },
            },
          },
        },
      },
    });

    // Обработка результата
    const result = {
      app: apps.map((app) => ({
        ...app,
        domain: app.domain
          ? {
              ...app.domain,
              SSL:
                app.domain.SSL.length > 0
                  ? [
                      app.domain.SSL.reduce((earliest, current) =>
                        new Date(current.expires) < new Date(earliest.expires)
                          ? current
                          : earliest,
                      ),
                    ]
                  : [],
            }
          : null, // Если domain null, оставляем его как null
      })),
    };

    return result;
  }
  // // получаем данные по приложению
  async getAppInfo(idApp: number, idServer: number, idCompany: number) {
    return {
      app: await this.prisma.app.findFirst({
        where: { idApp },
        include: {
          domain: { 
            select: { 
              idDomain: true,
              name: true,
              expires: true,
              SSL: true 
          }}
        }
      }),
      pageInfo: await this.prisma.page.findMany({
        where: { parentApp: idApp, },
        select: { 
          idPage: true,
          parentApp: true,
          title: true,
          urlPage: true,
          checkPage: {
            where: {
              date: {
                gte: new Date(Date.now() - 60 * 60 * 1000),
              },
            },
            orderBy: { date: 'desc' }
          }
        }
      }),
      server: await this.prisma.server.findFirst({
        where: { idServer: idServer },
      }),
      company: await this.prisma.company.findFirst({
        where: { idCompany: idCompany },
      }),
    };
  }
  async getAppPageHistory(idPage: number, idApp: number, idServer: number, idCompany: number) {
    return {
      app: await this.prisma.app.findFirst({
        where: { idApp },
      }),
      pageInfo: await this.prisma.page.findFirst({
        where: { idPage, },
      }),
      checkPageInfo: await this.prisma.checkPage.findMany({
        where: { parentPage: idPage, },
        orderBy: { date: 'desc' },
      }),
      server: await this.prisma.server.findFirst({
        where: { idServer: idServer },
      }),
      company: await this.prisma.company.findFirst({
        where: { idCompany: idCompany },
      }),
    }
  }

  async getAllNotifications() {
    return this.prisma.notification.findMany({
      orderBy: { date: 'desc' },
      take: 20,
    });
  }
}
