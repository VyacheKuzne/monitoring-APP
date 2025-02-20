// src/app.service.ts
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as puppeteer from 'puppeteer'; 
import { RecordPageService } from './recordPage.service';
import { PageData } from './page.interface';
import axios from 'axios';
import { interval, Subscription } from 'rxjs';

@Injectable()
export class PuppeteerService implements OnModuleInit, OnModuleDestroy
{
    constructor(private readonly recordPage: RecordPageService) {}
    private readonly logger = new Logger(PuppeteerService.name);

    private prisma = new PrismaClient();
    private browser: puppeteer.Browser;
    private page: puppeteer.Page;

    private intervalSubscription: any;
    private url = 'https://irkat.ru';
    private readonly pollingInterval = 60000;
  
    async onModuleInit() 
    {
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();

        this.startMonitoring();
    }
    
    async onModuleDestroy() 
    {
        this.stopMonitoring();
    }

    async startMonitoring()
    {
        this.logger.log(`Starting page monitoring with interval: ${this.pollingInterval}ms`);
        this.intervalSubscription = interval(this.pollingInterval).subscribe(() => {
            this.updatePageData();
        });
    }

    async updatePageData() {
        const response = await this.page.goto(this.url, { waitUntil: 'networkidle2' });
        this.logger.log(`Updated page data from: ${this.url}`);
    
        const statusLoadPage = response?.status().toString() ?? '';
        const statusLoadDOM = await this.page.evaluate(() => document.readyState);
    
        const resourceStatus = await this.getResourceStatus(this.page);
    
        const statusLoadContent = resourceStatus.allLoaded ? "Content fully loaded" : "Some resources not loaded";
    
        const navigationEntry = await this.page.evaluate(() => {
            const entries = performance.getEntriesByType('navigation');
            if (entries.length > 0) {
                const navEntry = entries[0] as PerformanceNavigationTiming;
                return {
                    startTime: navEntry.startTime,
                    responseEnd: navEntry.responseEnd
                };
            }
            return null;
        });
    
        const requestTime = navigationEntry?.startTime ?? 0;
        const responseTime = navigationEntry?.responseEnd ?? 0;
        const responseRate = responseTime - requestTime;
    
        // this.logger.log(`Load Metrics: 
        //     Status Load Page: ${statusLoadPage}
        //     Status Load Content: ${statusLoadContent}
        //     Status Load DOM: ${statusLoadDOM}
        //     ${resourceStatus.mediaStatus}
        //     ${resourceStatus.styleStatus}
        //     ${resourceStatus.scriptStatus}
    
        //     Request Time: ${requestTime.toFixed(2)} ms
        //     Response Time: ${responseTime.toFixed(2)} ms
        //     Response Rate: ${responseRate.toFixed(2)} ms
        // `);

        const PageData = {
            statusLoadPage,
            statusLoadContent,
            statusLoadDOM,
            mediaStatus: resourceStatus.mediaStatus,
            styleStatus: resourceStatus.styleStatus,
            scriptStatus: resourceStatus.scriptStatus,
            requestTime: requestTime.toFixed(2),
            responseTime: responseTime.toFixed(2),
            responseRate: responseRate.toFixed(2)
        };

        this.recordPage.recordPage(PageData);
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
        if (this.intervalSubscription) {
            this.intervalSubscription.unsubscribe(); // Остановить подписку на интервал
        }
        await this.browser.close();
    }

    // getPageData(domain) {
    //     return this.systemData$.asObservable();
    // }
}