import { Controller, Post, Body } from '@nestjs/common';
import { DomainService } from './createDomain.service';

@Controller('server')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Post('create')
  async createDomain(@Body() Body:{name: string, idCompany: number} ) {
    // Создаем сервер и связываем его с доменом
    return this.domainService.createServerAndLinkDomain(Body.name, Body.idCompany);
  }
}
  