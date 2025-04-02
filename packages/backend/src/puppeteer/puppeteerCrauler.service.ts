import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { MonitoringConfig } from './page.interface';
// import { RecordPageService } from './recordPage.service';
// import { PageData } from './page.interface';
import axios from 'axios';
// import { HttpService } from '@nestjs/axios';
import * as xml2js from 'xml2js';
// import pLimit from 'p-limit';
import { PuppeteerService } from './puppeteer.service';
import { AutorizationService } from 'src/puppeteer/functionForCrauler/autorization.service';
import { FindLinksInSitemap } from './functionForCrauler/findLinksInSitemap.service';
@Injectable()
export class PuppeteerCrauler {
  private readonly logger = new Logger(PuppeteerCrauler.name);
  private browser: Browser;

  constructor(
    private readonly AutorizationService: AutorizationService,
    @Inject(forwardRef(() => PuppeteerService))
    private readonly puppeteerService: PuppeteerService,
    private readonly findLinksInSitemap: FindLinksInSitemap,
  ) {}
  private PageCount = 0;
  private recursionDepth = 10;
  //   Запустить мониторинг страниц сайта, начиная с проверки sitemap.xml
  async startMonitoring(domain: string, authorized: boolean) {
    this.logger.log(`Starting the Domain page test: ${domain}`);
    this.browser = await puppeteer.launch({ args: ['--disable-web-security'] });
    await this.checkSitemap(domain, authorized);
  }

  // Определить, где искать страницы сайта — через sitemap.xml или обходя вручную с помощью Puppeteer
  async checkSitemap(domain: string, authorized: boolean) {
    const { data } = await axios.get('https://' + domain + '/robots.txt');
    const sitemapLines = data
      .split('\n')
      .filter((line) => line.trim().startsWith('Sitemap'))
      .map((line) => line.trim().replace('Sitemap:', '').trim());

    if (sitemapLines.length > 0) {
      this.logger.log(`Found sitemaps: ${sitemapLines}`);
      await this.findLinksInSitemap.findLinksInSitemap(sitemapLines, domain);
    } else {
      this.logger.log(`Sitemaps not found. The beginning of the link search`);
      await this.findLinksViaPuppeteer(domain, authorized);
    }
  }

  async findLinksViaPuppeteer(domain: string, authorized: boolean) {
    const startUrl = `https://${domain}`;
    const page: Page = await this.browser.newPage();
    const visitedLinks = new Set<string>();
    const toVisit = [`${startUrl}`];
    const errorLinks = new Set<string>();

    // 🔹 Список URL, которые не нужно проверять (заполни сам)
    const blacklistPatterns: RegExp[] = [
      /^https:\/\/a7-bill-stage\.tw1\.ru\/api\/users\/\d+$/,
    ];

    // 🔹 Функция для проверки URL в черном списке
    const isBlacklisted = (url: string): boolean => {
      return blacklistPatterns.some((pattern) => pattern.test(url));
    };

    const normalizeUrl = (url: string): string => url.split('#')[0];

    page.on('response', (response) => {
      const status = response.status();
      const url = response.url();
      if (status >= 400) {
        console.log(`Ошибка: ${url}, Статус: ${status}`);
        errorLinks.add(url);
      }
    });
    // 🔹 Функция получения ссылок
    const getLinks = async (url: string) => {
      try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        return await page.evaluate((domain: string) => {
          return Array.from(document.querySelectorAll('a'))
            .map((a) => a.href.trim())
            .filter(
              (href) =>
                href.startsWith('/') || href.startsWith(`https://${domain}`),
            )
            .map((href) =>
              href.startsWith('/') ? `https://${domain}${href}` : href,
            );
        }, domain);
      } catch (error) {
        console.error(`Ошибка при загрузке страницы ${url}:`, error);
        return [];
      }
    };

    // 🔹 Проверка вложенных страниц (например, /employees/1, /employees/2 и т. д.)
    const checkSubPages = async (baseUrl: string) => {
      let index = 1;
      while (true) {
        const testUrl = `${baseUrl}/${index}`;

        // Пропускаем URL из блэклиста
        if (isBlacklisted(testUrl)) {
          console.log(`⚠️ Пропущен (блэклист): ${testUrl}`);
          break;
        }

        try {
          const response = await page.goto(testUrl, {
            waitUntil: 'networkidle2',
          });
          console.log(
            `✅ Проверено: ${testUrl} (Статус: ${response?.status()})`,
          );
          index++;
        } catch (error) {
          console.log(`❌ Ошибка при проверке ${testUrl}:`, error);
          break;
        }
      }
    };

    // 🔹 Запуск проверки
    if (authorized) {
      this.logger.debug(authorized);
      await this.AutorizationService.login(page, domain);
      while (toVisit.length > 0) {
        const currentUrl = toVisit.shift()!;
        const normalizedUrl = normalizeUrl(currentUrl);

        if (visitedLinks.has(normalizedUrl) || isBlacklisted(normalizedUrl))
          continue;
        visitedLinks.add(normalizedUrl);

        const newLinks = await getLinks(currentUrl);
        for (const link of newLinks) {
          const normalizedLink = normalizeUrl(link);
          if (
            !visitedLinks.has(normalizedLink) &&
            !isBlacklisted(normalizedLink)
          ) {
            toVisit.push(normalizedLink);
          }
          await checkSubPages(normalizedLink);
        }

        console.log(
          `🔗 На странице ${currentUrl} найдено ${newLinks.length} ссылок.`,
        );
      }

      console.log('📊 Итог:', visitedLinks.size, 'страниц проверено');
    }
    else{
      return console.log('не прошла вторизация');
    }
    await this.puppeteerService.updatePageData(Array.from(visitedLinks));
    console.log('🛑 Мониторинг завершен');
    this.puppeteerService.stopMonitoring(domain);
  }
}
