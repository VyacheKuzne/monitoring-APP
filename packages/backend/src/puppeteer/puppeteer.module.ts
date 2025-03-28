import { Module } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
import { RecordPageService } from './recordPage.service';
import { PuppeteerResourceStatus } from './puppeteerResourceStatus.service';
import { PuppeteerController } from './puppeteer.controller';
import { HttpModule } from '@nestjs/axios';
import { PageStatusService } from './pageStatus.service';

@Module({
  imports: [HttpModule],
  providers: [PuppeteerService, RecordPageService, PuppeteerResourceStatus, PageStatusService],
  controllers: [PuppeteerController],
})
export class PuppeteerModule {}
