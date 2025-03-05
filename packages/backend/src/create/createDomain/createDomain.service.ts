import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class DomainService {
  private prisma = new PrismaClient(); // Инициализируем Prisma для взаимодействия с базой данных
  constructor(private readonly httpService: HttpService) {}

  // Этот метод будет отправлять запрос на получение данных Whois для указанного домена
  public async getWhoisData(domain: string): Promise<{ creationDate?: string }> {
    try {
      // Отправляем HTTP-запрос к API для получения информации о домене
      const response = await firstValueFrom(
        this.httpService.get(`http://localhost:3000/whois?domain=${domain}`)
      );
      return response.data; // Возвращаем полученные данные
    } catch (error) {
      console.error('Ошибка при получении информации о домене:', error);
      return {}; // Возвращаем пустой объект в случае ошибки
    }
  }

  // Метод для получения данных SSL с использованием внешнего API
  public async getSSLabsData(domain: string) {
    try {
      // Отправляем HTTP-запрос для получения данных о SSL для указанного домена
      const response = await axios.get(`http://localhost:3000/ssl-labs/analyze/${domain}`);
      return response.data; // Возвращаем полученные данные
    } catch (error) {
      console.error('Ошибка при получении информации о домене:', error);
      return {}; // Возвращаем пустой объект в случае ошибки
    }
  }

  // Этот метод будет отправлять запрос на получение данных о страницах домена
  public async getPagesData(domain: string): Promise<{ creationDate?: string }> {
    try {
      // Отправляем запрос на получение информации о страницах домена
      const response = await firstValueFrom(
        this.httpService.get(`http://localhost:3000/pages/${domain}`)
      );
      return response.data; // Возвращаем полученные данные
    } catch (error) {
      console.error('Ошибка при получении информации о страницах:', error);
      return {}; // Возвращаем пустой объект в случае ошибки
    }
  }

  // Функция для задержки в выполнении, используется для создания пауз между попытками
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms)); // Пауза в миллисекундах
  }

  // Функция для поиска домена с повторными попытками, если домен не найден
  private async findDomainWithRetries(domain: string, retries: number = 10, delay: number = 3000): Promise<any> {
    let attempt = 0; // Счетчик попыток

    // Пытаемся найти домен несколько раз с задержкой между попытками
    while (attempt < retries) {
      const existingDomain = await this.prisma.domain.findUnique({
        where: { name: domain }, // Ищем домен в базе данных
      });

      if (existingDomain) {
        return existingDomain;  // Возвращаем найденный домен
      }

      attempt++;  // Увеличиваем счетчик попыток
      console.log(`Domain ${domain} not found. Retrying... Attempt ${attempt}/${retries}`);
      await this.sleep(delay);  // Задержка перед повторной попыткой
    }

    // Если домен не найден после всех попыток, выбрасываем ошибку
    throw new Error(`Domain ${domain} not found after ${retries} attempts.`);
  }

  // Метод для создания приложения и связывания его с доменом и сервером
  public async createDomainAndLinkDomain(domain: string, appName: string, idCompany: number, serverId: number) {
    console.log(`Creating domain: ${domain}, appName: ${appName}, idCompany: ${idCompany}, serverId: ${serverId}`);
    
    // Получаем данные Whois о домене
    const whoisData = await this.getWhoisData(domain);
    // Получаем данные о SSL-сертификате домена
    const sslLabsData = await this.getSSLabsData(domain);
    // Получаем данные о страницах домена
    const getPagesData = await this.getPagesData(domain);

    // Преобразуем идентификаторы в числа (для проверки)
    const parentCompanyId = Number(idCompany);
    const parentServerId = Number(serverId);

    // Проверяем корректность идентификаторов
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

    // Шаг 2: Получаем дополнительные данные о домене, если необходимо (например, SSL)
    // const sslLabsData = await this.getSSLabsData(domain);
    // console.log('SSL Labs Data:', sslLabsData);

    // Шаг 3: Создаем приложение в базе данных и связываем его с доменом и сервером
    const createdApp = await this.prisma.app.create({
      data: {
        name: appName, // Имя приложения
        parentServer: parentServerId, // ID сервера, на котором будет работать приложение
        parentDomain: existingDomain.idDomain,  // ID домена, с которым связано приложение
      },
    });

    // Возвращаем созданное приложение
    return createdApp;
  }
}
