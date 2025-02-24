// src/app.service.ts
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as puppeteer from 'puppeteer'; 
import { RecordPageService } from './recordPage.service';
import { PageData } from './page.interface';
import axios from 'axios';
import * as xml2js from 'xml2js';

@Injectable()
export class PuppeteerService implements OnModuleDestroy
{
    constructor(private readonly recordPage: RecordPageService) {}
    private readonly logger = new Logger(PuppeteerService.name);

    private prisma = new PrismaClient();
    private browser: puppeteer.Browser;
    private page: puppeteer.Page;

    private intervalSubscription: any;

    async startPageMonitoring(domain: string)
    {
        this.logger.log(`Starting the Domain page test: ${domain}`);
        this.browser = await puppeteer.launch();
        await this.checkSitemap(domain);
    }
    
    async onModuleDestroy() 
    {
        this.stopMonitoring();
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

        await page.close();
        await this.updatePageData(puppedLinks);
    }

    async updatePageData(urls: string[]): Promise<void> {

        const page = await this.browser.newPage();

        try {
            for (const url of urls) {

                this.logger.log(`Processing URL: ${url}`);
                try {
                    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

                    const statusLoadPage = response?.status()?.toString() ?? 'Unknown';
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
                catch (error) {
                    this.logger.error(`Error load page`);
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
                    this.recordPage.recordPage(PageData);
                }
            }
        }
        finally {
            await page.close();
        }
    }

    async getResourceStatus(page: puppeteer.Page) {
        try {
            return await page.evaluate(() => {
                const mediaLoaded = Array.from(document.querySelectorAll('img'))
                    .every(img => img.complete && img.naturalWidth > 0);
                const mediaStatus = mediaLoaded ? "Loaded" : "Failed";
    
                // Стили (<link>, <style>, инлайн, @import)
                const sheets = [
                    ...Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[],
                    ...Array.from(document.querySelectorAll('style')) as HTMLStyleElement[],
                ];
                const styleLoaded = sheets.every(sheet => {
                    try {
                        const rules = sheet.sheet?.cssRules;
                        return rules && rules.length >= 0;
                    } catch (e) {
                        return false;
                    }
                });
                const styleStatus = styleLoaded ? "Loaded" : "Failed";
    
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
        } catch (error) {
            this.logger.error(`Error in getResourceStatus: ${error.message}`);
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
        await this.browser.close();
    }
}