// puppeteer.controller.ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
import { PageStatusService } from './pageStatus.service';

@Controller('pages')
export class PuppeteerController {
  constructor(
    private readonly puppeteerService: PuppeteerService,
    private readonly PageStatusService: PageStatusService,
  ) {}

  @Get('/:domain/:idApp/:authorized')
  async getPageLoadInfo(
    @Param('domain') domain: string,
    @Param('idApp', ParseIntPipe) idApp: number,
    @Param('authorized') authorized: boolean,
  ) {
    // Устанавливаем idApp в сервисе перед вызовом startPageMonitoring
    this.puppeteerService.setAppContext(idApp);


    // Теперь только передаем domain
    return this.puppeteerService.startPageMonitoring(domain, authorized);
  }

  @Get('status/app/:idApp')
  getPageStatus(@Param('idApp', ParseIntPipe) idApp: number) {
    return this.PageStatusService.getPageStatus(idApp);
  }
}
