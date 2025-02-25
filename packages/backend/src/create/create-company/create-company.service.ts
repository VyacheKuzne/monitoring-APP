import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CreateCompanyService {
    private prisma = new PrismaClient();
    async createCompany(name: string) {
        return this.prisma.company.create({
          data: {name},
        });
      }
}
