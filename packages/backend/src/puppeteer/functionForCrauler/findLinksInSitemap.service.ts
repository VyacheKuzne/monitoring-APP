import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';

// import { RecordPageService } from './recordPage.service';
// import { PageData } from './page.interface';
import axios from 'axios';
import * as xml2js from 'xml2js';
import { PuppeteerService } from '../puppeteer.service';
@Injectable()
export class FindLinksInSitemap {
  private readonly logger = new Logger(FindLinksInSitemap.name);
  private browser: Browser;
  private PageCount = 0;
  private recursionDepth = 10;
  constructor(
    private readonly puppeteerService:PuppeteerService
  ) {}

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
}
