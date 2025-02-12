import { Controller, Get, Param, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';
import * as whois from 'whois';

interface WhoisData {
  domainName?: string;
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  raw?: string; // Содержимое ответа whois в необработанном виде
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/companies/get')
  async getAllCompanies() 
  {
    return this.appService.getAllCompanies();
  }
  @Get('/company/:idCompany/get')
  async getCompany(@Param('idCompany') idCompany: number) 
  {
    const numberCompany = Number(idCompany);
    return this.appService.getCompany(numberCompany);
  }
}