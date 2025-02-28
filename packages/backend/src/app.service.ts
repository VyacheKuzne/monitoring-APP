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
      include: {
        serverHasDomain: {
          where: {
            domain: {
              name: { equals: 'host' },  // Filter for domain with name 'host'
            },
          },
          include: {
            domain: true,  // Include the domain details
          },
        },
      },
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
  async getAllNotifications() 
  {
    return this.prisma.notification.findMany({
      orderBy: { date: 'asc' },
      take: 20,
    });
  }
}
