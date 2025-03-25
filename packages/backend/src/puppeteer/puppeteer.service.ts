// src/app.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { RecordPageService } from './recordPage.service';
import { PageData } from './page.interface';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import * as xml2js from 'xml2js';
import pLimit from 'p-limit';

@Injectable()
export class PuppeteerService {
  private idApp: number; // Свойство для хранения idApp
  constructor(
    private readonly recordPage: RecordPageService,
    private readonly httpService: HttpService,
  ) {}

  private readonly logger = new Logger(PuppeteerService.name);
  private browser: puppeteer.Browser;

  private attempts = 100;
  private timeout = 90000;
  private concurrency = 3;
  private recursionDepth = 10;

  private PageCount = 0;
  private failedPageCount = 0;
  setAppContext(idApp: number) {
    this.idApp = idApp;
  }
  //   Запустить мониторинг страниц сайта, начиная с проверки sitemap.xml
  async startPageMonitoring(domain: string) {
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
    await this.updatePageData(allPageUrls);
    this.stopMonitoring(domain);
  }
  // Найти все внутренние ссылки на сайте, если sitemap.xml недоступен
  async findLinksViaPuppeteer(domain: string) {
    const startUrl = `https://${domain}`;
    const page = await this.browser.newPage();

    await page.goto(startUrl, { waitUntil: 'networkidle2' });

    const puppedLinks = await page.evaluate((domain) => {
      return Array.from(
        new Set(
          Array.from(document.querySelectorAll('a'))
            .map((a) => a.href.trim())
            .filter(
              (href) =>
                href.startsWith('/') || href.startsWith(`https://${domain}`),
            )
            .map((href) => (href.startsWith('/') ? `https://${domain}` : href)),
        ),
      );
    }, domain);

    this.PageCount = puppedLinks.length;

    await page.close();
    await this.updatePageData(puppedLinks);

    this.stopMonitoring(domain);
  }

  async runParallel<T>(
    items: T[],
    task: (item: T) => Promise<void>,
    concurrency: number = this.concurrency,
  ): Promise<void> {
    const limit = pLimit(concurrency);
    await Promise.all(items.map((item) => limit(() => task(item))));
  }
  // самая большая, Проверить доступность страниц, собрать данные о загрузке и зафиксировать результаты
  async updatePageData(urls: string[]): Promise<void> {
    const processUrl = async (url: string): Promise<void> => {
      const page = await this.browser.newPage();
      try {
        this.logger.log(`Processing URL: ${url}`);

        let attempts = this.attempts;
        let timeout = this.timeout;
        let statusLoadPage = 'Unknown';
        let response: puppeteer.HTTPResponse | null = null;

        while (attempts--) {
          try {
            response = await page.goto(url, {
              waitUntil: 'networkidle2',
              timeout,
            });

            if (response) {
              statusLoadPage = response.status().toString();
            }
            break;
          } catch (error) {
            this.logger.error(
              `Could not read the page, attempts left ${attempts}`,
            );
            if (attempts === 0) {
              this.logger.error(`Failed to load page after multiple attempts`);
              statusLoadPage = 'Error';
              this.failedPageCount++;
              break;
            }
            timeout += 15000;
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
        try {
          if (statusLoadPage !== 'Error') {
            // Страница загрузилась успешно, выполняем проверки
            await page.waitForFunction(
              () => document.readyState === 'complete',
            );
            const statusLoadDOM = await page.evaluate(
              () => document.readyState,
            );

            const resourceStatus = await this.getResourceStatus(page);
            const statusLoadContent = resourceStatus.allLoaded
              ? 'Content fully loaded'
              : 'Some resources not loaded';

            const navigationEntry = await page.evaluate(() => {
              const entries = performance.getEntriesByType('navigation');
              if (entries.length > 0) {
                const navEntry = entries[0] as PerformanceNavigationTiming;
                return {
                  startTime: navEntry.startTime,
                  responseEnd: navEntry.responseEnd,
                };
              }
              return null;
            });

            const requestTime = navigationEntry?.startTime ?? 0;
            const responseTime = navigationEntry?.responseEnd ?? 0;
            const responseRate = responseTime - requestTime;
            this.logger.log(`Страница загрузилась коректно, url:${url}`);
            if (!this.idApp) {
              this.logger.log('idAPP is error!');
            }

            const PageData: PageData = {
              parentApp: this.idApp,
              urlPage: url,
              statusLoadPage,
              statusLoadContent,
              statusLoadDOM,
              mediaStatus: resourceStatus.mediaStatus,
              styleStatus: resourceStatus.styleStatus,
              scriptStatus: resourceStatus.scriptStatus,
              requestTime: requestTime.toFixed(2),
              responseTime: responseTime.toFixed(2),
              responseRate: responseRate.toFixed(2),
            };
            this.recordPage.recordPage(PageData);
          } else {
            throw new Error(`Failed to load after all attempts`);
          }
        } catch (error) {
          this.logger.error(`Error load page: ${error.message}`);
          const PageData: PageData = {
            parentApp: this.idApp,
            urlPage: url,
            statusLoadPage: 'Error',
            statusLoadContent: 'Failed',
            statusLoadDOM: 'Unknown',
            mediaStatus: 'Failed',
            styleStatus: 'Failed',
            scriptStatus: 'Failed',
            requestTime: '0',
            responseTime: '0',
            responseRate: '0',
          };
          this.failedPageCount++;
          this.recordPage.recordPage(PageData);
        }
        // Очистка состояния страницы перед следующим URL
        await page.goto('about:blank');
        await page.evaluate(() => performance.clearResourceTimings());
      } finally {
        await page.close();
      }
    };
    // Запускаем параллельную обработку всех URL
    await this.runParallel(urls, processUrl, this.concurrency);
  }
  async clearCaches(page: puppeteer.Page) {
    await page.evaluate(() => {
      // Очистка cookies
      document.cookie.split(';').forEach(function (c) {
        document.cookie =
          c.trim().replace(/^.+$/, '') +
          ';expires=Thu, 01 Jan 1970 00:00:00 GMT';
      });

      // Очистка localStorage и sessionStorage
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  async getResourceStatus(page: puppeteer.Page) {
    try {
      const networkStatus = {
        mediaStatus: 'Failed',
        styleStatus: 'Failed',
        scriptStatus: 'Failed',
      };

      const responses: Set<string> = new Set();
      const failedCssRequests: string[] = [];
      const failedRequests: string[] = [];
      const failedRequestDetails: string[] = [];
      let cachedMediaCount = 0;

      const pageDomain = new URL(page.url()).hostname;

      const hasScripts = await page.$$eval(
        'script[src]',
        (scripts) => scripts.length > 0,
      );
      const hasStyles = await page.$$eval(
        'link[rel="stylesheet"], style',
        (styles) => styles.length > 0,
      );
      const hasMedia = await page.$$eval(
        'img, [style*="background-image"]',
        (elements) => elements.length > 0,
      );

      if (!hasScripts) networkStatus.scriptStatus = 'Not required';
      if (!hasStyles) networkStatus.styleStatus = 'Not required';

      await page.setRequestInterception(true);

      page.on('request', (request) => {
        // this.logger.debug(`Request made: ${request.method()} ${request.url()}`);
        request.continue();
      });

      page.on('response', (response) => {
        const url = response.url();
        const status = response.status();
        const contentType = response.headers()['content-type'];
        const fromCache = response.fromCache();
        const resourceDomain = new URL(url).hostname;

        if (resourceDomain !== pageDomain) return;

        // Логируем тип контента и ресурс
        // this.logger.debug(`Response received: ${response.status()} ${url} (fromCache: ${fromCache})`);
        this.logger.debug(`Content-Type: ${contentType}`);

        /*** Проверка загрузки стилей ***/
        if (
          contentType?.includes('stylesheet') ||
          contentType?.includes('text/css')
        ) {
          if (status >= 200 && status <= 304) {
            responses.add('style');
            this.logger.debug(
              `✅ CSS loaded: ${url} (fromCache: ${fromCache})`,
            );
          } else {
            failedCssRequests.push(url);
            this.logger.error(
              `❌ CSS failed to load: ${url} with status: ${status}`,
            );
          }
          if (failedCssRequests.length > 0) {
            networkStatus.styleStatus = 'Failed';
          } else if (responses.has('style')) {
            networkStatus.styleStatus = 'Loaded';
          }
          if (status < 200 || status > 304) {
            failedRequests.push(url);
            failedRequestDetails.push(
              `Failed request: ${url} with status: ${status}`,
            );
          }
          if (!hasStyles) networkStatus.styleStatus = 'Not required'; // не работает
        } else {
          // Логирование, когда блок if не был выполнен
          this.logger.log(
            `No CSS content-type found for: ${url}. Content-Type: ${contentType}`,
          );
        }

        /*** Проверка загрузки медиафайлов ***/
        if (
          contentType?.startsWith('image/') ||
          contentType?.includes('svg+xml') ||
          contentType?.includes('image/gif') ||
          /\.(svg|webp|png|jpg|jpeg|gif|bmp|avif)$/i.test(url)
        ) {
          responses.add('media');
          if (fromCache) cachedMediaCount++;
        }

        /*** Проверка загрузки скриптов ***/
        if (contentType?.includes('javascript')) {
          responses.add('script');
        }
      });

      page.on('requestfailed', (request) => {
        const url = request.url();
        const resourceDomain = new URL(url).hostname;
        if (resourceDomain !== pageDomain) return;

        this.logger.error(
          `❌ Request failed: ${url} with error: ${request.failure()?.errorText}`,
        );
        failedRequests.push(url);
        failedRequestDetails.push(
          `Request failed: ${url} with error: ${request.failure()?.errorText}`,
        );
      });

      await this.clearCaches(page);
      await page.goto(page.url(), { waitUntil: 'networkidle2' });

      await page.evaluate(async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      });

      /*** Проверка inline-изображений ***/
      const hasInlineImages = await page.evaluate(() => {
        return [...document.images].some((img) =>
          img.src.startsWith('data:image'),
        );
      });
      if (hasInlineImages) responses.add('media');

      /*** Проверка отображаемых изображений ***/
      const displayedImages = await page.evaluate(() => {
        return [...document.images].filter(
          (img) => img.complete && img.naturalWidth > 0,
        ).length;
      });

      /*** Проверка загруженных скриптов ***/
      const loadedScripts = await page.evaluate(() => {
        return [...document.scripts]
          .map((script) => script.src)
          .filter((src) => src);
      });
      if (loadedScripts.length > 0) responses.add('script');

      /*** Итоговая проверка статуса медиа ***/
      if (!hasMedia && !responses.has('media')) {
        networkStatus.mediaStatus = 'Not required';
      } else {
        const totalMedia = displayedImages + cachedMediaCount;
        networkStatus.mediaStatus = totalMedia > 0 ? 'Loaded' : 'Failed';
      }

      /*** Итоговая проверка статуса скриптов ***/
      networkStatus.scriptStatus = responses.has('script')
        ? 'Loaded'
        : hasScripts
          ? 'Failed'
          : 'Not required';

      if (failedRequests.length > 0) {
        this.logger.error(
          `🚨 Failed resource requests on page ${page.url()}: ${failedRequests.join(', ')}`,
        );
        this.logger.error(
          `📌 Detailed failed requests on page ${page.url()}: ${failedRequestDetails.join('; ')}`,
        );
      }

      return {
        allLoaded:
          networkStatus.styleStatus === 'Loaded' &&
          networkStatus.mediaStatus === 'Loaded' &&
          networkStatus.scriptStatus === 'Loaded',
        mediaStatus: networkStatus.mediaStatus,
        styleStatus: networkStatus.styleStatus,
        scriptStatus: networkStatus.scriptStatus,
        finalStatus:
          networkStatus.styleStatus === 'Loaded' &&
          networkStatus.mediaStatus === 'Loaded' &&
          networkStatus.scriptStatus === 'Loaded'
            ? 'Content fully loaded'
            : 'Some resources not loaded',
      };
    } catch (error) {
      this.logger.error(`🔥 Resource acquisition error: ${error.message}`);
      return {
        allLoaded: false,
        mediaStatus: 'Failed',
        styleStatus: 'Failed',
        scriptStatus: 'Failed',
        finalStatus: 'Some resources not loaded',
      };
    }
  }

  // Завершить мониторинг, зафиксировать статистику и оповестить о критических ошибках.
  async stopMonitoring(domain: string) {
    this.logger.log(
      `Мониторинг ${domain} завершен. Всего страниц: ${this.PageCount}, Количество страниц со статусом error: ${this.failedPageCount}`,
    );
    if (this.failedPageCount / this.PageCount >= 0.1) {
      const url = 'http://localhost:3000/notification/create';
      const percent = Math.round((this.failedPageCount / this.PageCount) * 100);
      const data = {
        text: `При проверке страниц приложения ${domain}, количество провальных проверок достигло ${percent}%.`,
        parentCompany: null,
        parentServer: null,
        parentApp: null,
      };

      await this.httpService.post(url, data).toPromise();
    }

    await this.browser.close();
    this.PageCount = 0;
    this.failedPageCount = 0;
  }
}
// декомпозиция: создание сайт мапа, проверка ссылок, проверка ресурсов(проверка style, js, media), сохранение данных. итого: 4 общих + 3 детальных по каждой проверке 