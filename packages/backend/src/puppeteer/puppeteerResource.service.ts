import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
// import { RecordPageService } from './recordPage.service';
// import { PageData } from './page.interface';
// import axios from 'axios';
// import { HttpService } from '@nestjs/axios';
// import * as xml2js from 'xml2js';
// import pLimit from 'p-limit';
import { PuppeteerService } from './puppeteer.service';
@Injectable()
export class PuppeteerResource {
  private readonly logger = new Logger(PuppeteerResource.name);
  private browser: puppeteer.Browser;
  constructor(
    @Inject(forwardRef(() => PuppeteerService))
    private readonly puppeteerService: PuppeteerService,
  ) {}

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
}
