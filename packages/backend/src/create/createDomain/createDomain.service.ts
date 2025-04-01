import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import { ProgressGateway } from './progress.gateway'; // Импортируем ProgressGateway
import { NotificationService } from '../create-notification/createNotification.service';
@Injectable()
export class DomainService {
  private prisma = new PrismaClient(); // Инициализируем Prisma для взаимодействия с базой данных
  constructor(
    private readonly httpService: HttpService,
    private readonly NotificationService: NotificationService,
    @Inject(forwardRef(() => ProgressGateway))
    private readonly progressGateway: ProgressGateway, // Используем forwardRef
  ) {}
  private readonly logger = new Logger(DomainService.name);

  // Метод для отправки прогресса
  private sendProgress(progress: number, message: string) {
    this.progressGateway.updateProgress(progress, message);
  }

  // Этот метод будет отправлять запрос на получение данных Whois для указанного домена
  public async getWhoisData(
    domain: string,
  ): Promise<{ creationDate?: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://localhost:3000/whois?domain=${domain}`),
      );
      this.NotificationService.createNotification({
        text: `Успешно получены данные по домену ${domain}`,
        parentCompany: null,
        parentServer: null,
        parentApp: null,
        status: 'notification',
        date: new Date(),
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении информации о домене:', error);
      return {}; // Возвращаем пустой объект в случае ошибки
    }
  }

  // Метод для получения данных SSL с использованием внешнего API
  public async getSSLabsData(domain: string) {
    try {
      const response = await axios.get(
        `http://localhost:3000/ssl-labs/analyze/${domain}`,
      );
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении информации о домене:', error);
      return {};
    }
  }

  // Этот метод будет отправлять запрос на получение данных о страницах домена
  public async getPagesData(
    domain: string,
    idApp: number,
  ): Promise<{ creationDate?: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://localhost:3000/pages/${domain}/${idApp}`),
      );
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении информации о страницах:', error);
      return {};
    }
  }

  // Функция для задержки в выполнении, используется для создания пауз между попытками
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Функция для поиска домена с повторными попытками, если домен не найден
  private async findDomainWithRetries(
    domain: string,
    retries: number = 10,
    delay: number = 3000,
  ): Promise<any> {
    let attempt = 0;
    while (attempt < retries) {
      const existingDomain = await this.prisma.domain.findUnique({
        where: { name: domain },
      });

      if (existingDomain) {
        return existingDomain;
      }

      attempt++;
      console.log(
        `Domain ${domain} not found. Retrying... Attempt ${attempt}/${retries}`,
      );
      await this.sleep(delay);
    }

    throw new Error(`Domain ${domain} not found after ${retries} attempts.`);
  }

  // Метод для создания приложения и связывания его с доменом и сервером
  public async createDomainAndLinkDomain(
    domain: string,
    appName: string,
    idCompany: number,
    serverId: number,
  ) {
    this.sendProgress(10, 'Запрос данных WHOIS...');
    const whoisData = await this.getWhoisData(domain);

    this.sendProgress(30, 'Данные WHOIS получены');
    this.sendProgress(40, 'Запрос данных SSL...');
    const sslLabsData = this.getSSLabsData(domain);

    this.sendProgress(60, 'Данные SSL получены');

    const parentCompanyId = Number(idCompany);
    const parentServerId = Number(serverId);

    if (isNaN(parentCompanyId) || isNaN(parentServerId)) {
      throw new Error('Invalid company or server ID');
    }

    this.sendProgress(70, 'Поиск домена...');
    let existingDomain = await this.findDomainWithRetries(domain);

    this.sendProgress(80, 'Создание приложения...');
    const createdApp = await this.prisma.app.create({
      data: {
        name: appName,
        parentServer: parentServerId,
        parentDomain: existingDomain.idDomain,
      },
    });

    this.sendProgress(90, 'Проверяем станицы приложения');
    const idApp = createdApp.idApp;

    // Получаем данные о страницах домена
    const getPagesData = await this.getPagesData(domain, idApp);
    this.sendProgress(100, 'Создание завершено');
    return createdApp;
  }
}
