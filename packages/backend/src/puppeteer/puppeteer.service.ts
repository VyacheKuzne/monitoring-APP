// src/app.service.ts
import { Injectable, forwardRef, Logger, Inject } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import * as xml2js from 'xml2js';
import pLimit from 'p-limit';
import { RecordPageService } from './recordPage.service';
import { PageData } from './page.interface';
import { PuppeteerCrauler } from './puppeteerCrauler.service';
import { PuppeteerResource } from './puppeteerResource.service';
@Injectable()
export class PuppeteerService {
  private idApp: number; // Свойство для хранения idApp
  constructor(
    private readonly recordPage: RecordPageService,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => PuppeteerCrauler))
    private readonly PuppeteerCrauler: PuppeteerCrauler,
    @Inject(forwardRef(() => PuppeteerResource))
    private readonly PuppeteerResource: PuppeteerResource,
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
    await this.PuppeteerCrauler.startMonitoring(domain);
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
      const puppeteer = require('puppeteer');
      this.browser = await puppeteer.launch(); // Инициализация браузера
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

            const resourceStatus =
              await this.PuppeteerResource.getResourceStatus(page);
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
