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
export class PuppeteerService
{
    constructor(
        private readonly recordPage: RecordPageService, 
        private readonly httpService: HttpService
    ) {}

    private readonly logger = new Logger(PuppeteerService.name);
    private browser: puppeteer.Browser;
    private isMonitoring: boolean = false;
    private attempts = 3;
    private timeout = 30000;
    private concurrency = 5;

    private PageCount = 0;
    private failedPageCount = 0;

    async startPageMonitoring(domain: string)
    {
        if (this.isMonitoring) {
            this.logger.log(`Monitoring already in progress for domain: ${domain}`);
            return;
        }

        this.isMonitoring = true;
        this.logger.log(`Starting the Domain page test: ${domain}`);
        this.browser = await puppeteer.launch({ args: ['--disable-web-security'] });
        await this.checkSitemap(domain);
    }

    async checkSitemap(domain: string)
    {
        const { data } = await axios.get('https://' + domain + '/robots.txt');
        const sitemapLines = data
            .split('\n')
            .filter(line => line.trim().startsWith('Sitemap'))
            .map(line => line.trim().replace('Sitemap:', '').trim());

        if (sitemapLines.length > 0) {
            this.logger.log(`Found sitemaps: ${sitemapLines}`);
            await this.findLinksInSitemap(sitemapLines);
        }
        else {
            this.logger.log(`Sitemaps not found. The beginning of the link search`);
            await this.findLinksViaPuppeteer(domain);
        }
    }

    async findLinksInSitemap(sitemapLines: [])
    {

        for (const sitemapUrl of sitemapLines) {
            try {
                const sitemapResponse = await axios.get(sitemapUrl);
                const sitemapData = sitemapResponse.data;
                const parsedSitemap = await xml2js.parseStringPromise(sitemapData);

                if (parsedSitemap?.urlset?.url) {
                const pageUrls = parsedSitemap.urlset.url.map((entry: any) => entry.loc[0]);
                this.logger.debug(`Found ${pageUrls.length} links in ${sitemapUrl}`);

                this.updatePageData(pageUrls);
                }
                else if(parsedSitemap?.sitemapindex?.sitemap)
                {
                const nestedSitemaps = parsedSitemap.sitemapindex.sitemap.map((entry: any) => entry.loc[0]);
                this.logger.debug(`Found ${nestedSitemaps.length} nested sitemaps in ${sitemapUrl}`);

                for (const nestedSitemapUrl of nestedSitemaps) {
                    try {
                        const nestedResponse = await axios.get(nestedSitemapUrl);
                        const nestedParsed = await xml2js.parseStringPromise(nestedResponse.data);
                        const nestedPageUrls = nestedParsed.urlset.url.map((entry: any) => entry.loc[0]);
                        this.logger.debug(`Found ${nestedPageUrls.length} links in ${nestedSitemapUrl}`);
                        this.PageCount = nestedPageUrls.length;
                        
                        await this.updatePageData(nestedPageUrls);
                    } 
                    catch (nestedError) {
                        this.logger.error(`Sitemap load error ${nestedSitemapUrl}: ${nestedError.message}`);
                    }
                }
                }
            }
            catch(sitemapError) {
                this.logger.error(`Sitemap load error ${sitemapUrl}: ${sitemapError.message}`);
            }
        }
    }

    async findLinksViaPuppeteer(domain: string)
    {
        const startUrl = `https://${domain}`;
        const page = await this.browser.newPage();

        await page.goto(startUrl, { waitUntil: 'networkidle2' });

        const puppedLinks = await page.evaluate((domain) => {
            return Array.from(new Set(
                Array.from(document.querySelectorAll('a'))
                    .map(a => a.href.trim())
                    .filter(href => href.startsWith('/') || href.startsWith(`https://${domain}`))
                    .map(href => href.startsWith('/') ? `https://${domain}${href}` : href)
            ));
        }, domain);
        
        this.PageCount = puppedLinks.length;

        await page.close();
        await this.updatePageData(puppedLinks);
    }

    async runParallel<T>(
        items: T[],
        task: (item: T) => Promise<void>,
        concurrency: number = this.concurrency
    ): Promise<void> 
    {
        const limit = pLimit(concurrency);
        await Promise.all(items.map(item => limit(() => task(item))));
    }

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
                        response = await page.goto(url, { waitUntil: 'networkidle2', timeout });

                        if (response) {
                            statusLoadPage = response.status().toString();
                        }
                        break;
                    }
                    catch (error) {
                        this.logger.error(`Could not read the page, attempts left ${attempts}`);
                        if (attempts === 0) {
                            this.logger.error(`Failed to load page after multiple attempts`);
                            statusLoadPage = 'Error';
                            this.failedPageCount++;
                            break;
                        }
                        timeout += 15000;
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                try {
                    if (statusLoadPage !== 'Error') {
                        // Страница загрузилась успешно, выполняем проверки
                        await page.waitForFunction(() => document.readyState === "complete");
                        const statusLoadDOM = await page.evaluate(() => document.readyState);

                        const resourceStatus = await this.getResourceStatus(page);
                        const statusLoadContent = resourceStatus.allLoaded ? "Content fully loaded" : "Some resources not loaded";

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

                        this.logger.log(`Page loaded correctly`);
                        const PageData: PageData = {
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
                    } 
                    else {
                        throw new Error(`Failed to load after all attempts`);
                    }
                } 
                catch (error) {
                    this.logger.error(`Error load page: ${error.message}`);
                    const PageData: PageData = {
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
            }
            finally {
                await page.close();
            }
        };
        // Запускаем параллельную обработку всех URL
        await this.runParallel(urls, processUrl, this.concurrency);
        
        this.stopMonitoring();
    }

    async getResourceStatus(page: puppeteer.Page) {
        try {
            return await page.evaluate(() => {
                // Медиа (Картинки, видео, аудио)
                const mediaLoaded = [
                    ...Array.from(document.querySelectorAll('img')).filter(img => img.hasAttribute('src')),
                    ...Array.from(document.querySelectorAll('video')).filter(video => video.hasAttribute('src')),
                    ...Array.from(document.querySelectorAll('audio')).filter(audio => audio.hasAttribute('src'))
                ].every(media => {
                    if (media instanceof HTMLImageElement) {
                        return media.complete && media.naturalWidth > 0;
                    }
                    if (media instanceof HTMLVideoElement || media instanceof HTMLAudioElement) {
                        return media.readyState >= 3; // 3 — достаточно данных для воспроизведения
                    }
                    return false;
                });

                const mediaStatus = mediaLoaded ? "Loaded" : "Failed";
    
                // Стили (<link>, <style>, инлайн, @import)
                const styleElements = [
                    ...Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[],
                    ...Array.from(document.querySelectorAll('style')) as HTMLStyleElement[],
                ];
                
                let styleLoaded = true;
                const importedSheets: CSSStyleSheet[] = [];

                styleElements.forEach(element => {
                    const sheet = element.sheet;
                    if (!sheet) {
                        styleLoaded = false;
                        return;
                    }

                    try {
                        const rules = Array.from(sheet.cssRules);
                        const importRules = rules.filter(rule => rule instanceof CSSImportRule) as CSSImportRule[];
                        importRules.forEach(importRule => {
                          if (importRule.styleSheet) {
                            importedSheets.push(importRule.styleSheet);
                          }
                        });
                    }
                    catch (error) {
                        this.logger.error(`Error accessing cssRules:`, error);
                        styleLoaded = false;
                    }
                });
                const styleStatus = styleLoaded ? "Loaded" : "Failed";
    
                // Скрипты
                const scriptLoaded = Array.from(document.querySelectorAll('script[src]'))
                    .every(script => script.hasAttribute('async') || script.hasAttribute('defer') || document.readyState === 'complete');
                const scriptStatus = scriptLoaded ? "Loaded" : "Failed";
    
                const allLoaded = mediaLoaded && styleLoaded && scriptLoaded;
    
                return {
                    allLoaded,
                    mediaStatus,
                    styleStatus,
                    scriptStatus,
                };
            });
        } 
        catch (error) {
            this.logger.error(`Resource acquisition error`);
            return {
                allLoaded: false,
                mediaStatus: "Failed",
                styleStatus: "Failed",
                scriptStatus: "Failed",
            };
        }
    }

    async stopMonitoring()
    {
        this.logger.log(`Stop monitoring pages. Total pages: ${this.PageCount}, Failed pages: ${this.failedPageCount}`);
        if((this.failedPageCount / this.PageCount) >= 0.1)
        {
            const url = 'http://localhost:3000/notification/create';
            const percent = Math.round((this.failedPageCount / this.PageCount) * 100);
            const data = {
                text: `При проверке страниц приложения {}, количество провальных проверок достигло ${percent}%.`,
                parentCompany: null,
                parentServer: null,
                parentApp: null,
            }

            await this.httpService.post(url, data).toPromise();
        }

        await this.browser.close();
        this.PageCount = 0;
        this.failedPageCount= 0;
        this.isMonitoring = false;
    }
}