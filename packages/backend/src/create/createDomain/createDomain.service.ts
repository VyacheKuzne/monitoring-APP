import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class DomainService {
  private prisma = new PrismaClient();
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

  // Метод для получения данных SSL
  public async getSSLabsData(domain: string) {
    try {
      const response = await axios.get(`http://localhost:3000/ssl-labs/analyze/${domain}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении информации о домене:', error);
      return {};
    }
  }
  // Этот метод будет отправлять запрос на получение данных о страницах 
  public async getPagesData(domain: string): Promise<{ creationDate?: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://localhost:3000/pages/${domain}`)
      );
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении информации о страницах:', error);
      return {};
    }
  }
  // Функция для ожидания
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Функция для повторных попыток поиска домена с задержкой
  private async findDomainWithRetries(domain: string, retries: number = 10, delay: number = 3000): Promise<any> {
    let attempt = 0;

    while (attempt < retries) {
      const existingDomain = await this.prisma.domain.findUnique({
        where: { name: domain },
      });

      if (existingDomain) {
        return existingDomain;  // Возвращаем домен, если найден
      }

      attempt++;
      console.log(`Domain ${domain} not found. Retrying... Attempt ${attempt}/${retries}`);
      await this.sleep(delay);  // Задержка перед повторной попыткой
    }

    throw new Error(`Domain ${domain} not found after ${retries} attempts.`);
  }

  // Метод для создания приложения и связывания его с доменом
  public async createDomainAndLinkDomain(domain: string, appName: string, idCompany: number, serverId: number) {
    console.log(`Creating domain: ${domain}, appName: ${appName}, idCompany: ${idCompany}, serverId: ${serverId}`);
    
    // Получаем данные Whois
    const whoisData = await this.getWhoisData(domain);
    // Получаем данные SSL Labs
    const sslLabsData = await this.getSSLabsData(domain);
    // Получаем данные о страницах 
    const getPagesData = await this.getPagesData(domain);
    // console.log('SSL Labs Data:', sslLabsData);

    // Преобразуем идентификаторы
    const parentCompanyId = Number(idCompany);
    const parentServerId = Number(serverId);

    if (isNaN(parentCompanyId)) {
      console.error(`Invalid idCompany: ${idCompany}. It should be a valid number.`);
      throw new Error('idCompany must be a valid number');
    }

    if (isNaN(parentServerId)) {
      console.error(`Invalid idServer: ${serverId}. It should be a valid number.`);
      throw new Error('idServer must be a valid number');
    }

    // Шаг 1: Используем повторные попытки для поиска домена
    let existingDomain = await this.findDomainWithRetries(domain);

    // Шаг 2: Получаем дополнительные данные о домене (например, SSL)
    // const sslLabsData = await this.getSSLabsData(domain);
    // console.log('SSL Labs Data:', sslLabsData);

    // Шаг 3: Создаем приложение и связываем его с доменом и сервером
    const createdApp = await this.prisma.app.create({
      data: {
        name: appName,
        parentServer: parentServerId,
        parentDomain: existingDomain.idDomain,  // ID домена из базы данных
      },
    });

    return createdApp;
  }
}
