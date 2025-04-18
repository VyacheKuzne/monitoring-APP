import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { MonitoringConfig } from './page.interface';
// import { RecordPageService } from './recordPage.service';
// import { PageData } from './page.interface';
import axios from 'axios';
// import { HttpService } from '@nestjs/axios';
// import * as xml2js from 'xml2js';
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
    this.logger.log(`Начало проверок для приложения: ${domain}`);
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
      this.logger.log(
        `Сайт мап не найден. Начинаем искать в автоматическом режиме`,
      );
      await this.findLinksViaPuppeteer(domain, authorized);
    }
  }

  async findLinksViaPuppeteer(domain: string, authorized: boolean) {
    this.logger.debug('Начал работать findLinksViaPuppeteer');
    const startUrl = `https://${domain}`;
    const page: Page = await this.browser.newPage();
    const visitedLinks = new Set<string>();
    const toVisit = [`${startUrl}`];
    const errorLinks = new Set<string>();
    let subPageCandidates: string[] = [];

    const blacklistPatterns: RegExp[] = [
      /^https:\/\/a7-bill-stage\.tw1\.ru\/api\/users\/\d+$/,
    ];

    const isBlacklisted = (url: string): boolean => {
      const blacklisted = blacklistPatterns.some((pattern) =>
        pattern.test(url),
      );
      if (blacklisted)
        console.log(`🚫 URL ${url} в черном списке, пропускаем.`);
      return blacklisted;
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

    const getLinks = async (url: string) => {
      this.logger.debug('Начал работать getLinks');
      try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        const links = await page.evaluate((domain: string) => {
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

        return links.filter((link) => !isBlacklisted(link)); // Фильтруем перед возвратом
      } catch (error) {
        console.error(`Ошибка при загрузке страницы ${url}:`, error);
        return [];
      }
    };

    const checkSubPages = async (baseUrls: string[]) => {
      this.logger.debug('Начал работать checkSubPages');
      baseUrls = baseUrls.filter((url) => !isBlacklisted(url)); // Убираем ссылки перед обработкой
      for (const baseUrl of baseUrls) {
        let index = 1;
        while (true) {
          const testUrl = `${baseUrl}/${index}`;

          if (isBlacklisted(testUrl)) {
            console.log(`⚠️ Пропущен (блэклист): ${testUrl}`);
            break; // Прерываем цикл на первом запрещенном URL
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
      }
    };

    this.logger.debug(
      `Проверяем авторизацию: ${authorized}, тип: ${typeof authorized}`,
    );
    if (authorized) {
      this.logger.debug(`Авторизация нужна`);
      await this.AutorizationService.login(page, domain);
    } else {
      this.logger.debug(`Авторизация не нужна`);
    }

    while (toVisit.length > 0) {
      const currentUrl = toVisit.shift()!;
      const normalizedUrl = normalizeUrl(currentUrl);

      if (visitedLinks.has(normalizedUrl) || isBlacklisted(normalizedUrl)) {
        continue;
      }
      visitedLinks.add(normalizedUrl);

      const newLinks = await getLinks(currentUrl);
      for (const link of newLinks) {
        const normalizedLink = normalizeUrl(link);
        if (!visitedLinks.has(normalizedLink)) {
          toVisit.push(normalizedLink);
          subPageCandidates.push(normalizedLink);
        }
      }

      console.log(
        `🔗 На странице ${currentUrl} найдено ${newLinks.length} ссылок.`,
      );
    }

    console.log('📊 Итог:', visitedLinks.size, 'страниц проверено');

    await this.puppeteerService.updatePageData(Array.from(visitedLinks));

    console.log('🛑 Запускаем проверку вложенных страниц...');
    await checkSubPages(subPageCandidates);

    console.log('🛑 Мониторинг завершен');
    this.puppeteerService.stopMonitoring(domain);
  }
}
