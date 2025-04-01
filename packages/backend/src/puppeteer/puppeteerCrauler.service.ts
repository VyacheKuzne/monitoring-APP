import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { RecordPageService } from './recordPage.service';
import { PageData } from './page.interface';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import * as xml2js from 'xml2js';
import pLimit from 'p-limit';
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
    try {
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
    catch (error) {
      this.logger.error(`Failed to fetch robots.txt for ${domain}: ${error.message}`);
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
    await this.puppeteerService.updatePageData(allPageUrls, this.PageCount);
    this.puppeteerService.stopMonitoring(domain);
  }

  async findLinksViaPuppeteer(domain: string) {
    const startUrl = `https://${domain}`;
    const page = await this.browser.newPage();

    // Множество для хранения всех уникальных ссылок
    const visitedLinks = new Set<string>(); // Указываем, что это множество строк
    const toVisit = [`https://${domain}`];

    // Переменные для отслеживания ошибок
    const errorLinks = new Set<string>();

    // Функция для нормализации ссылок (удаление якоря)
    const normalizeUrl = (url: string): string => {
      // Убираем якорь, если он есть
      return url.split('#')[0];
    };

    // Обработчик ответов для проверки статусов
    page.on('response', (response) => {
      const status = response.status();
      const url = response.url();

      // Если статус 404 или другие ошибки, добавляем ссылку в errorLinks
      if (status >= 400) {
        console.log(`Ошибка для ресурса: ${url}, Статус: ${status}`);
        errorLinks.add(url);
      }

      // Проверка загрузки стилей, JS и картинок
      if (
        url.endsWith('.css') ||
        url.endsWith('.js') ||
        url.endsWith('.jpg') ||
        url.endsWith('.png')
      ) {
        if (status >= 400) {
          console.log(`Ошибка при загрузке ресурса: ${url}`);
          errorLinks.add(url);
        }
      }
    });

    // Функция для извлечения ссылок с текущей страницы
    const getLinks = async (url: string) => {
      try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Извлекаем ссылки с текущей страницы
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

        return links;
      } catch (error) {
        console.error(`Ошибка при загрузке страницы ${url}:`, error);
        return [];
      }
    };

    // Рекурсивная функция для обхода всех ссылок
    const exploreLinks = async () => {
      // Пока есть страницы для обработки
      while (toVisit.length > 0) {
        const currentUrl = toVisit.shift()!; // Берем следующую страницу

        // Нормализуем текущий URL перед проверкой
        const normalizedUrl = normalizeUrl(currentUrl);

        // Если эту ссылку уже посетили, пропускаем её
        if (visitedLinks.has(normalizedUrl)) continue;

        visitedLinks.add(normalizedUrl); // Помечаем ссылку как посещенную

        // Получаем все ссылки с текущей страницы
        const newLinks = await getLinks(currentUrl);

        // Добавляем новые ссылки в очередь для дальнейшей обработки
        newLinks.forEach((link) => {
          const normalizedLink = normalizeUrl(link);
          if (!visitedLinks.has(normalizedLink)) {
            toVisit.push(normalizedLink);
          }
        });

        // Выводим количество найденных ссылок
        console.log(
          `На странице ${currentUrl} найдено ${newLinks.length} ссылок.`,
        );
      }

      // Завершаем процесс, обновляем данные
      this.PageCount = visitedLinks.size; // Обновляем количество страниц
      await this.puppeteerService.updatePageData(Array.from(visitedLinks), this.PageCount); // Приводим к типу string[]

      // Добавляем в отчет ошибки 404 и другие ошибки с ресурсами
      console.log('Ошибки (404 и другие):', Array.from(errorLinks));

      this.puppeteerService.stopMonitoring(domain); // Завершаем мониторинг
    };

    // Запускаем функцию обхода ссылок
    await exploreLinks();
  }
}
