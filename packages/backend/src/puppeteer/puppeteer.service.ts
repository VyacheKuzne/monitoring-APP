// src/app.service.ts
import { Injectable, forwardRef, Logger, Inject } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import * as xml2js from 'xml2js';
import pLimit from 'p-limit';
import { RecordPageService } from './recordPage.service';
import { PageData, СheckPageData } from './page.interface';
import { PuppeteerCrauler } from './puppeteerCrauler.service';
import { PuppeteerResource } from './puppeteerResource.service';
import { PrismaClient } from '@prisma/client';
import { PuppeteerCheckFile } from './puppeteerCheckFile.service';
import { NotificationService } from '../create/create-notification/createNotification.service';

@Injectable()
export class PuppeteerService {
  private idApp: number; // Свойство для хранения idApp
  private prisma = new PrismaClient();
  constructor(
    private readonly recordPage: RecordPageService,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => PuppeteerCrauler))
    private readonly PuppeteerCrauler: PuppeteerCrauler,
    @Inject(forwardRef(() => PuppeteerResource))
    private readonly PuppeteerResource: PuppeteerResource,
    private readonly PuppeteerCheckFile: PuppeteerCheckFile,
    private readonly NotificationService: NotificationService,
  ) {}

  private readonly logger = new Logger(PuppeteerService.name);
  private browser: puppeteer.Browser;
  private attempts = 3;
  private timeout = 90000;
  private concurrency = 1;
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
  async updatePageData(urls: string[], pageCount: number): Promise<void> {
    this.PageCount = pageCount;
    const processUrl = async (url: string): Promise<void> => {
      const puppeteer = require('puppeteer');
      this.browser = await puppeteer.launch({protocolTimeout: 10000}); // Инициализация браузера
      const page = await this.browser.newPage();

      let title = '';

      let PageData: PageData = {
        parentApp: this.idApp,
        title: title,
        urlPage: url,
      }

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
            
            title = await page.evaluate(() => document.title);
            if (title && title.trim() !== '') {
              PageData.title = title;
            }
            const isFile = await this.PuppeteerCheckFile.checkFile(response);

            if (!PageData.title && isFile) {
              let fileName = url.split('/').pop() || url;
              fileName = decodeURIComponent(fileName);
              const cleanedFileName = fileName.replace(/\s+/g, '_');
              PageData.title = `Файл - ${cleanedFileName}`;
            }

            // Страница загрузилась успешно, выполняем проверки
            await page.waitForFunction(
              () => document.readyState === 'complete',
            );
            const statusLoadDOM = await page.evaluate(
              () => document.readyState,
            );

            let statusLoadContent = '';
            let mediaStatus = '';
            let styleStatus = '';
            let scriptStatus = '';
            if(!isFile) {
              const resourceStatus = await this.PuppeteerResource.getResourceStatus(page);
              statusLoadContent = resourceStatus.allLoaded 
                ? 'Content fully loaded' : 'Some resources not loaded';
              mediaStatus = resourceStatus.mediaStatus;
              styleStatus = resourceStatus.styleStatus;
              scriptStatus = resourceStatus.scriptStatus;
            }
            else {
              statusLoadContent = 'Content fully loaded';
              let mediaStatus = 'Loaded';
              let styleStatus = 'Loaded';
              let scriptStatus = 'Loaded';
            }

            const responseTime = (await page.evaluate(() => {
              const entry = performance.getEntriesByType('navigation')[0];
              return entry instanceof PerformanceNavigationTiming ? entry.responseEnd : 0;
            }));

            this.logger.log(`The ${url} page loaded correctly`);
            if (!this.idApp) {
              this.logger.log('idAPP is error!');
            }

            const СheckPageData: СheckPageData = {
              statusLoadPage,
              statusLoadContent,
              statusLoadDOM,
              mediaStatus,
              styleStatus,
              scriptStatus,
              responseTime: responseTime.toFixed(2),
            };
            this.recordPage.recordPage(PageData, СheckPageData);
          } else {
            throw new Error(`Failed to load after all attempts`);
          }
        } catch (error) {
          this.logger.error(`Error load page: ${error.message}`);
          PageData.title = url;

          const СheckPageData: СheckPageData = {
            statusLoadPage: 'Error',
            statusLoadContent: 'Failed',
            statusLoadDOM: 'Unknown',
            mediaStatus: 'Failed',
            styleStatus: 'Failed',
            scriptStatus: 'Failed',
            responseTime: '0',
          };
          this.failedPageCount++;
          this.recordPage.recordPage(PageData, СheckPageData);
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
      `Monitoring of ${domain} is completed. Total pages: ${this.PageCount}, The number of pages with the error status: ${this.failedPageCount}`,
    );

    const app = await this.prisma.app.findFirst({
      where: {
        idApp: this.idApp
      },
      select: {
        parentServer: true,
        server: {
          select: {
            parentCompany: true
          }
        }
      }
    })

    if (this.failedPageCount / this.PageCount >= 0.1 || this.PageCount == 0) {

      const percent = Math.round((this.failedPageCount / this.PageCount) * 100);
      this.NotificationService.createNotification({
        text: this.PageCount > 0 ?
          `При проверке страниц приложения ${domain}, количество провальных проверок достигло ${percent}%.` :
          `При проверке страниц приложения ${domain}, общее количество страниц осталось на 0. Перепроверьте домен.`,
        parentCompany: app?.server.parentCompany ?? null,
        parentServer: app?.parentServer ?? null,
        parentApp: this.idApp,
        status: 'alert',
        date: new Date()
      });
    }

    await this.browser.close();
    this.PageCount = 0;
    this.failedPageCount = 0;
  }
}
// декомпозиция: создание сайт мапа, проверка ссылок, проверка ресурсов(проверка style, js, media), сохранение данных. итого: 4 общих + 3 детальных по каждой проверке
