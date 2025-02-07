// src/app.controller.ts
import { Controller, Get, Post, Body, Param, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';
import * as whois from 'whois';

interface WhoisData {
  domainName?: string;
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  raw?: string; // Содержимое ответа whois в необработанном виде
}

@Controller('domains')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('random')
  async getRandomDomain(): Promise<{ domain: string }> {
    return this.appService.getRandomDomain();
  }

  @Get(':domain/whois')
  async getWhoisInfo(@Param('domain') domain: string): Promise<WhoisData> {
    try {
      const whoisData: string = await new Promise((resolve, reject) => {
        whois.lookup(domain, { followAllRedirects: true }, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });

      if (!whoisData) {
        throw new NotFoundException(`Whois data not found for domain: ${domain}`);
      }

      // ПРОСТОЙ ПРИМЕР: Возвращаем просто raw данные
      return { domainName: domain, raw: whoisData };
    } catch (error) {
      console.error('Error during whois lookup:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to retrieve whois data for domain: ${domain}`);
    }
  }
}

@Controller('company')
export class AppControlleeer {
  constructor(private readonly appService: AppService) {}

  @Post('/create')
  async createCompany(@Body() body: { name: string }) {
    return this.appService.createCompany(body.name);
  }
  @Get('/get')
  async getCompany() {
    return this.appService.getCompany();
  }
}