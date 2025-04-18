import { Server } from './interfaces/server';
import { Controller, Post, Body } from '@nestjs/common';
import { ServerService } from './create-server.service';

@Controller('server')
export class ServerController {
  constructor(private readonly domainService: ServerService) {}

  @Post('create')
  async createDomain(@Body() Body: { name: string; idCompany: number }) {
    // Создаем сервер и связываем его с доменом
    return this.domainService.createServerAndLinkDomain(
      Body.name,
      Body.idCompany,
    );
  }
}
