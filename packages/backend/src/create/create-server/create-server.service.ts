import { Server } from './interfaces/server';
import { Response } from 'express';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class ServerService {
  private prisma = new PrismaClient(); // создаем экземпляр Prisma для работы с базой данных

  constructor(private readonly httpService: HttpService) {}

  // Новый метод для создания сервера и связывания его с доменом передаем обьект для заполнения дмоена и связей
  public async createServerAndLinkDomain(domain: string, idCompany: number) {
    // Получаем информацию о домене (например, дату регистрации)
    // Преобразуем idCompany в число, если это строка
    const parentCompanyId = Number(idCompany);

    // Проверяем, что idCompany передан и не равен undefined
    if (isNaN(parentCompanyId)) {
      throw new Error('idCompany must be a valid number');
    }

    // Создаем новый сервер
    const createdServer = await this.prisma.server.create({
      data: {
        ipAddress: '192.168.1.1',
        hostname: domain,
        location: 'Data Center 1',
        os: 'Linux',
        parentCompany: parentCompanyId, // Используем преобразованное число
      },
    });

    // // Связываем сервер с доменом
    // await this.prisma.serverHasDomain.create({
    //   data: {
    //     server: {
    //       connect: { idServer: createdServer.idServer },  // Связываем сервер с доменом через connect
    //     },
    //     domain: {
    //       connect: { name: domain },  // Связываем домен с сервером
    //     },
    //   },
    // });

    return createdServer;
  }
}
