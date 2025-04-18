import { Injectable } from '@nestjs/common';
import prisma from '../../../prisma/prisma.service';

@Injectable()
export class CreateCompanyService {
  private prisma = prisma;
  async createCompany(name: string) {
    return this.prisma.company.create({
      data: { name },
    });
  }
}
