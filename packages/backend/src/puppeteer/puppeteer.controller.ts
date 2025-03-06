// puppeteer.controller.ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';

@Controller('pages')
export class PuppeteerController {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  @Get('/:domain/:idApp')
  async getPageLoadInfo(
    @Param('domain') domain: string,
    @Param('idApp', ParseIntPipe) idApp: number,
  ) {
    // Устанавливаем idApp в сервисе перед вызовом startPageMonitoring
    this.puppeteerService.setAppContext(idApp);

    // Теперь только передаем domain
    return this.puppeteerService.startPageMonitoring(domain);
  }
}
