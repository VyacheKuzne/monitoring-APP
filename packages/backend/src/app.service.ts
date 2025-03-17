// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AppService 
{
  private prisma = new PrismaClient();

  async getAllCompanies() 
  {
    return this.prisma.company.findMany();
  }
  async getCompany(idCompany: number) 
  {
    return this.prisma.company.findFirst({
      where: { idCompany: idCompany }
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
  
  
  async getServer(numberServer: number, numberCompany: number) 
  {
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
  async getApp(numberServer: number) 
  {
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
      app: apps.map(app => ({
        ...app,
        domain: app.domain
          ? {
              ...app.domain,
              SSL: app.domain.SSL.length > 0
                ? [app.domain.SSL.reduce((earliest, current) =>
                    new Date(current.expires) < new Date(earliest.expires) ? current : earliest
                  )]
                : [],
            }
          : null, // Если domain null, оставляем его как null
      })),
    };
    
    return result;
  }
  // // получаем данные по приложению
  async getAppInfo( idApp: number, idServer: number, idCompany: number) 
  {
    return {
      app: await this.prisma.app.findFirst({
        where: {idApp: idApp},
      }),
      pageInfo: await this.prisma.checkPage.findMany({
        where: {parentApp: idApp}
      }),
      server: await this.prisma.server.findFirst({
        where: { idServer: idServer },
      }),
      company: await this.prisma.company.findFirst({
        where: { idCompany: idCompany },
      }),
    };
  }
  async getAllNotifications() 
  {
    return this.prisma.notification.findMany({
      orderBy: { date: 'asc' },
      take: 20,
    });
  }
}
