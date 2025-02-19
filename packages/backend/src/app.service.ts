// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

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
  async createCompany(name: string) {
    return this.prisma.company.create({
      data: {name},
    });
  }
  async getServers(idCompany: number) 
  {
    return this.prisma.server.findMany({
      where: { parentCompany: idCompany },
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
}
