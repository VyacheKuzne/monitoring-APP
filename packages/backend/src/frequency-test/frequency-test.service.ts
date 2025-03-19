import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Интервалы для различных задач
const INTERVALS = {
  daily: 24 * 60 * 60 * 1000, // 1 день
  hourly: 60 * 10 * 1000, // 10 минут
};

@Injectable()
export class FrequencyTestService implements OnModuleInit, OnModuleDestroy {
  private prisma = new PrismaClient();
  private readonly logger = new Logger(FrequencyTestService.name);

  constructor(private readonly httpService: HttpService) {}

  // Инициализация задач
  async onModuleInit() {
    this.startTasks();
  }

  // Остановка задач
  onModuleDestroy() {
    // Здесь можно остановить задачи, может потребовтаься если нужно останвить проверки без остановик сервера
  }

  // Метод для запуска всех задач с интервалами
  private startTasks() {
    // this.runTaskWithInterval('updateWhoisData', INTERVALS.daily);
    // this.runTaskWithInterval('updateSSLabsData', INTERVALS.daily);
    this.runTaskWithInterval('updatePagesData', INTERVALS.hourly);
  }

  // Метод для запуска задачи с интервалом, который будет начинаться после завершения предыдущей
  private async runTaskWithInterval(taskName: string, interval: number) {
    try {
      // Запускаем задачу
      switch (taskName) {
        // case 'updateWhoisData':
        //   await this.updateWhoisData();
        //   break;
        // case 'updateSSLabsData':
        //   await this.updateSSLabsData();
        //   break;
        case 'updatePagesData':
          await this.updatePagesData();
          break;
        default:
          this.logger.error(`Неизвестная задача: ${taskName}`);
          return;
      }

      // После завершения задачи, планируем её выполнение снова
      this.logger.log(`******** Задача ${taskName} завершена, планируем повторный запуск...`);
      setTimeout(() => this.runTaskWithInterval(taskName, interval), interval); // Запускаем задачу снова через интервал
    } catch (error) {
      this.logger.error(`******** Ошибка в задаче ${taskName}: ${error.message}`);
    }
  }

// Получаем все домены вместе с их идентификаторами приложений
async getAllDomain() {
    try {
      const domainInfo = await this.prisma.app.findMany({
        select: {
          idApp: true,          // id приложения
          parentDomain: true,   // id домена в таблице domain
          domain: {
            select: {
              name: true,       // имя домена из таблицы domain
            },
          },
        },
      });
  
      console.log(`Успешно получены домены и идентификаторы приложений: ${domainInfo.map(d => `${d.idApp} -> ${d.domain?.name ?? 'Нет данных'}`).join(', ')}`);
      
      return { domainInfo };
    } catch (error) {
      console.error('Ошибка при получении доменов:', error);
      throw error;
    }
  }
  

// АВТОМАТИЧЕСКАЯ ПРОВЕРКА WHOIS
public async updateWhoisData(): Promise<void> {
  const domain = await this.getAllDomain(); // Получаем все домены

  for (const domainData of domain.domainInfo) {
    this.logger.log(`🔍 Начало автоматической проверки WHOIS для домена: ${domainData.domain.name}`);
    try {
      const updateResultWhois = await firstValueFrom(
        this.httpService.get(`http://localhost:3000/whois?domain=${domainData.domain.name}`)
      );
      this.logger.log(`✅ Завершена автоматическая проверка WHOIS для домена ${domainData.domain.name}: ${JSON.stringify(updateResultWhois.data)}`);
    } catch (error) {
      this.logger.error(`❌ Ошибка при получении информации WHOIS для домена: ${domainData.domain.name}`, error);
    }
  }
}

// АВТОМАТИЧЕСКАЯ ПРОВЕРКА SSL
public async updateSSLabsData(): Promise<void> {
  const domain = await this.getAllDomain(); // Получаем все домены

  for (const domainData of domain.domainInfo) {
    this.logger.log(`🔍 Начало автоматической проверки SSL для домена: ${domainData.domain.name}`);
    try {
      await firstValueFrom(
        this.httpService.get(`http://localhost:3000/ssl-labs/analyze/${domainData.domain.name}`)
      );
      this.logger.log(`✅ Завершена автоматическая проверка SSL для домена ${domainData.domain.name}`);
    } catch (error) {
      this.logger.error(`❌ Ошибка при получении информации SSL для домена: ${domainData.domain.name}`, error);
    }
  }
}

// АВТОМАТИЧЕСКАЯ ПРОВЕРКА СТРАНИЦ
public async updatePagesData(): Promise<void> {
  const domain = await this.getAllDomain(); // Получаем все домены

  for (const domainData of domain.domainInfo) {
    this.logger.log(`🔍 Начало автоматической проверки страниц для домена: ${domainData.domain.name}`);

    try {
      // Дожидаемся завершения запроса
      const updateResultPages = await firstValueFrom(
        this.httpService.get(`http://localhost:3000/pages/${domainData.domain.name}/${domainData.idApp}`)
      );

      // Проверяем, есть ли в ответе данные (на случай, если Puppeteer уже работает)
      if (updateResultPages.data?.status === 'in_progress') {
        this.logger.warn(`⚠️ Мониторинг уже выполняется для домена: ${domainData.domain.name}, пропускаем...`);
      } else {
        this.logger.log(`✅ Завершена автоматическая проверка страниц для домена ${domainData.domain.name}: ${JSON.stringify(updateResultPages.data)}`);
      }
    } catch (error) {
      this.logger.error(`❌ Ошибка при получении информации о страницах для домена: ${domainData.domain.name}`, error);
    }
  }
}

}
