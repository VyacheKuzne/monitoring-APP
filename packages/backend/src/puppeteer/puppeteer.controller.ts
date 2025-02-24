import { Controller, Get, Param } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';

@Controller('pages')
export class PuppeteerController {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  @Get('/:domain')
  getPageLoadInfo(@Param('domain') domain: string)
  {
    return this.puppeteerService.startPageMonitoring(domain);
  }
}