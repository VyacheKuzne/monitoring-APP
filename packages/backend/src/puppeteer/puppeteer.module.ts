import { Module } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
import { RecordPageService } from './recordPage.service';
import { PuppeteerController } from './puppeteer.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PuppeteerService, RecordPageService],
  controllers: [PuppeteerController],
})
export class PuppeteerModule {}