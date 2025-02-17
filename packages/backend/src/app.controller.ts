import { Controller, Get, Post, Param, Body, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
  @Post('/company/create')
  async createCompany(@Body() body: { name: string }) {
    return this.appService.createCompany(body.name);
  }
  @Get('/company/:idCompany/servers/get')
  async getServers(@Param('idCompany') idCompany: number) 
  {
    const numberCompany = Number(idCompany);
    return this.appService.getServers(numberCompany);
  }
  @Get('/company/:idCompany/server/:idServer/get')
  async getServer(@Param('idCompany') idCompany: number, @Param('idServer') idServer: number) {
    const numberCompany = Number(idCompany);
    const numberServer = Number(idServer);
    return this.appService.getServer(numberCompany, numberServer);
  }
  
}