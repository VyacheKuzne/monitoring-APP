import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { path } from 'd3';
@Injectable()
export class AutorizationService {
  private readonly logger = new Logger(AutorizationService.name);
  private browser: puppeteer.Browser;
  async login(page, domain) {
    const loginUrl = `https://${domain}/login`;

    try {
      this.logger.debug('пошла жара');
      await page.goto(loginUrl, { waitUntil: 'networkidle2' });
      await page.waitForSelector('[data-path="username"]');
      await page.waitForSelector('[data-path="password"]');
      await page.type('[data-path="username"]', 'Documentation2');
      await page.type('[data-path="password"]', 'BryEfp89v6A2Sh9xNw');
      await page.$eval('button[type="submit"]', (btn) =>
        (btn as HTMLButtonElement).click(),
      );
      await page.screenshot({path: 'google.png'});
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      console.log('✅ Авторизация успешна!');
    } catch (error) {
      console.error('❌ Ошибка авторизации:', error);
      return false;
    }
    return true;
  }
}
