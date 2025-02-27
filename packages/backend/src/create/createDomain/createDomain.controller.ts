import { Controller, Post, Body } from '@nestjs/common';
import { DomainService } from './createDomain.service';

@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Post('create')
  async createDomain(@Body() Body: { name: string; appName: string; idCompany: number; idServer: number }) {
    // Проверяем, что все необходимые параметры есть в теле запроса
    if (!Body.idServer) {
      throw new Error('idServer is required');
    }
    if (!Body.idCompany) {
      throw new Error('idCompany is required');
    }

    return this.domainService.createDomainAndLinkDomain(Body.name, Body.appName, Body.idCompany, Body.idServer);
  }
}
