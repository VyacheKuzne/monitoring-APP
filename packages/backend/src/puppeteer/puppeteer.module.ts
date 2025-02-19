import { Module } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
import { RecordPageService } from './recordPage.service';
import { PuppeteerController } from './puppeteer.controller';

@Module({
  providers: [PuppeteerService, RecordPageService],
  controllers: [PuppeteerController],
})
export class PuppeteerModule {}