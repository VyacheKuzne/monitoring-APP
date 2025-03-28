import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';
import { RecordedIpService } from 'src/create/create-server/recordedIP.service';

@Injectable()
export class ServerService {
  private prisma = new PrismaClient();

  constructor(
    private readonly httpService: HttpService,
    private readonly recordedIpService: RecordedIpService // Исправлено с заглавной буквы
  ) {}

  public async createServerAndLinkDomain(hostname: string, idCompany: number) {
    const parentCompanyId = Number(idCompany);
    if (isNaN(parentCompanyId)) {
      throw new Error('idCompany must be a valid number');
    }

    // Получаем IP и местоположение
    const { ipAddress, location } = await this.recordedIpService.getIpAndLocation(hostname);

    // Создаем новый сервер с полученными данными
    const createdServer = await this.prisma.server.create({
      data: {
        ipAddress,
        hostname,
        location,
        os: 'Linux',
        parentCompany: parentCompanyId,
      },
    });

    return createdServer;
  }
}
