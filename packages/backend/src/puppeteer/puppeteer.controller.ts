import { Controller, Get } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
import { Observable, map } from 'rxjs';
import { Response } from 'express';

@Controller()
export class PuppeteerController {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  @Get('')
  getPageLoadInfo()
  {
    // return this.puppeteerService.getPageData();
  }
}