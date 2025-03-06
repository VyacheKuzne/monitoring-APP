import { Controller, Get, Post, Param, Body,  NotFoundException, InternalServerErrorException, ParseIntPipe } from '@nestjs/common';
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

  @Get('/company/:idCompany/servers/get')
  async getServers(@Param('idCompany') idCompany: number) 
  {
    const numberCompany = Number(idCompany);
    return this.appService.getServers(numberCompany);
  }
  @Get('/company/:idCompany/server/:idServer/get')
  async getServer(@Param('idServer') idServer: number, @Param('idCompany') idCompany: number) {
    const numberServer = Number(idServer);
    const numberCompany = Number(idCompany);
    return this.appService.getServer(numberServer, numberCompany);
  }
  // маршурт чтобы получить данные о приложениях на сервере
@Get('/company/:idCompany/server/:idServer/app/get')
  async getApp(@Param('idServer') idServer: number) {
    const numberServer = Number(idServer);
    return this.appService.getApp(numberServer);
  }
  // // запрос на получение данных о приложении 
  // @Get('/company/:idCompany/server/:idServer/app/:idApp')
  // async getAppInfo(@Param('idApp', ParseIntPipe) idApp: number){
  //   return this.appService.getAppInfo(idApp);
  // }

  @Get('/notifications/get')
  async getAllNotifications() 
  {
    return this.appService.getAllNotifications();
  }
}