import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DomainService {
  private prisma = new PrismaClient(); // создаем экземпляр Prisma для работы с базой данных

  constructor(private readonly httpService: HttpService) {}

  // Этот метод будет отправлять запрос на получение данных Whois
  public async getWhoisData(domain: string): Promise<{ creationDate?: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://localhost:3000/whois?domain=${domain}`)
      );
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении информации о домене:', error);
      return {};
    }
  }

  // Новый метод для создания сервера и связывания его с доменом передаем обьект для заполнения дмоена и связей 
  public async createServerAndLinkDomain(domain: string) {
    // Получаем информацию о домене (например, дату регистрации)
    const whoisData = await this.getWhoisData(domain);
  
    // Создаем новый сервер
    const createdServer = await this.prisma.server.create({
      data: {
        ipAddress: '192.168.1.1', // Пример данных
        hostname: domain,         // Используем домен как hostname
        location: 'Data Center 1',
        os: 'Linux',
        parentCompany: 1,         // ID компании, например, 1
      },
    });
  
    // Связываем сервер с доменом
    await this.prisma.serverHasDomain.create({
      data: {
        server: {
          connect: { idServer: createdServer.idServer },  // Связываем сервер с доменом через connect
        },
        domain: {
          connect: { name: domain },  // Связываем домен с сервером
        },
      },
    });
  
    return createdServer;
  }
  
}
