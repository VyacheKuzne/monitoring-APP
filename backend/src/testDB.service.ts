// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class testDBService {

  private prisma = new PrismaClient(); // Создаём Prisma клиент

  async createCompany(name: string) {
    return this.prisma.company.create({
      data: {name},
    });
  }
  async getCompany() {
    return this.prisma.company.findMany();
  }
  async editCompany(idCompany: number, name: string) {
    const companyIndex = this.prisma.company.findIndex(company => company.id === idCompany);

    return this.prisma.company.create({
      data: {name},
    });
  }
  async deleteCompany(idCompany: number) {
    return this.prisma.company.findMany();
  }
}
