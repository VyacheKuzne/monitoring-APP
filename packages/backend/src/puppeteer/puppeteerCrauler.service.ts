import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
// import { RecordPageService } from './recordPage.service';
// import { PageData } from './page.interface';
import axios from 'axios';
// import { HttpService } from '@nestjs/axios';
import * as xml2js from 'xml2js';
// import pLimit from 'p-limit';
import { PuppeteerService } from './puppeteer.service';
@Injectable()
export class PuppeteerCrauler {
  private readonly logger = new Logger(PuppeteerCrauler.name);
  private browser: puppeteer.Browser;
  constructor(
    @Inject(forwardRef(() => PuppeteerService))
    private readonly puppeteerService: PuppeteerService,
  ) {}
  private PageCount = 0;
  private recursionDepth = 10;
  //   Запустить мониторинг страниц сайта, начиная с проверки sitemap.xml
  async startMonitoring(domain: string) {
    this.logger.log(`Starting the Domain page test: ${domain}`);
    this.browser = await puppeteer.launch({ args: ['--disable-web-security'] });
    await this.checkSitemap(domain);
  }

  // Определить, где искать страницы сайта — через sitemap.xml или обходя вручную с помощью Puppeteer
  async checkSitemap(domain: string) {
    const { data } = await axios.get('https://' + domain + '/robots.txt');
    const sitemapLines = data
      .split('\n')
      .filter((line) => line.trim().startsWith('Sitemap'))
      .map((line) => line.trim().replace('Sitemap:', '').trim());

    if (sitemapLines.length > 0) {
      this.logger.log(`Found sitemaps: ${sitemapLines}`);
      await this.findLinksInSitemap(sitemapLines, domain);
    } else {
      this.logger.log(`Sitemaps not found. The beginning of the link search`);
      await this.findLinksViaPuppeteer(domain);
    }
  }

  // Найти все страницы сайта через sitemap.xml, включая вложенные sitemaps
  async findLinksInSitemap(sitemapLines: string[], domain: string) {
    const processSitemap = async (
      sitemapUrl: string,
      depth: number,
    ): Promise<string[]> => {
      if (depth > this.recursionDepth) {
        console.warn(
          `The maximum recursion depth (${this.recursionDepth}) for ${sitemapUrl} has been reached`,
        );
        return [];
      }

      try {
        const sitemapResponse = await axios.get(sitemapUrl);
        const sitemapData = sitemapResponse.data;
        const parsedSitemap = await xml2js.parseStringPromise(sitemapData);

        if (parsedSitemap?.urlset?.url) {
          const pageUrls = parsedSitemap.urlset.url.map(
            (entry: any) => entry.loc[0],
          );

          this.logger.debug(`Found ${pageUrls.length} links in ${sitemapUrl}`);
          return pageUrls;
        } else if (parsedSitemap?.sitemapindex?.sitemap) {
          const nestedSitemaps = parsedSitemap.sitemapindex.sitemap.map(
            (entry: any) => entry.loc[0],
          );
          this.logger.debug(
            `Found ${nestedSitemaps.length} nested sitemaps in ${sitemapUrl}`,
          );

          // Рекурсивно обрабатываем каждый вложенный sitemap
          const allNestedUrls: string[] = [];
          for (const nestedSitemapUrl of nestedSitemaps) {
            const nestedUrls = await processSitemap(nestedSitemapUrl, 1);
            allNestedUrls.push(...nestedUrls);
          }
          return allNestedUrls;
        }
        return [];
      } catch (sitemapError) {
        this.logger.error(
          `Sitemap load error ${sitemapUrl}: ${sitemapError.message}`,
        );
        return [];
      }
    };

    this.logger.debug(`Start search pages`);
    const allPageUrls: string[] = [];
    for (const sitemapUrl of sitemapLines) {
      const pageUrls = await processSitemap(sitemapUrl, 1);
      allPageUrls.push(...pageUrls);
    }

    this.logger.debug(`Total pages found: ${allPageUrls.length}`);
    this.PageCount = allPageUrls.length;
    await this.puppeteerService.updatePageData(allPageUrls);
    this.puppeteerService.stopMonitoring(domain);
  }

  async findLinksViaPuppeteer(domain: string) {
    const loginUrl = `https://${domain}/login`;
    const startUrl = `https://${domain}`;
    const page = await this.browser.newPage();
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

    // 🔹 кликаем по самайлику
    const login = async () => {
      try {
        // <div data-v-0de1e7e2="" class="mini-smiley" style="top: 48.7492%; left: 75.9852%;">
        //   😀
        // </div>
        await page.goto(loginUrl, { waitUntil: 'networkidle2' });
        await page.waitForSelector('[data-path="username"]');
        await page.waitForSelector('[data-path="password"]');
        await page.waitForSelector('[class="mini-smiley"]');
        await page.type('[data-path="username"]', '21213');
        await page.type('[data-path="password"]', 'xayixa');

        await page.waitForSelector('[class="mini-smiley"]', { visible: true });
        await page.$eval('button[type="submit"]', (btn) =>
          (btn as HTMLButtonElement).click(),
        );
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        console.log('✅ Авторизация успешна!');
      } catch (error) {
        console.error('❌ Ошибка авторизации:', error);
        return false;
      }
      return true;
    };

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
    if (await login()) {
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

    await this.puppeteerService.updatePageData(Array.from(visitedLinks));
    console.log('🛑 Мониторинг завершен');
    this.puppeteerService.stopMonitoring(domain);
  }
}
