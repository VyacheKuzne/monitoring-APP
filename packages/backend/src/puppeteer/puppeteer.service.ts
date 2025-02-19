// src/app.service.ts
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as puppeteer from 'puppeteer'; 
import { RecordPageService } from './recordPage.service';
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
    private url = 'https://www.cloudflare.com/ru-ru/';
    private readonly pollingInterval = 20000;
  
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
    
        const statusLoadPage = response?.status();
        const statusLoadDOM = await this.page.evaluate(() => document.readyState);
    
        const resourceStatus = await this.getResourceStatus(this.page);
    
        const statusLoadContent = resourceStatus.allLoaded ? "Content fully loaded" : "Some resources are still loading";
    
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
        return await page.evaluate(() => {
            const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
            const mediaResources = resources.filter(entry => entry.initiatorType === 'img');
            const scriptResources = resources.filter(entry => entry.initiatorType === 'script');
    
            const styleSheetsLoaded = document.styleSheets.length > 0;
            const computedStyleCheck = window.getComputedStyle(document.body).color !== "";
    
            const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                .map(link => (link as HTMLLinkElement).href);
    
            const perfResources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
            const styleResources = perfResources.filter(entry => entry.initiatorType === 'link');
    
            function getStatus(resources: PerformanceResourceTiming[], type: string) {
                if (resources.length === 0) return `${type}: No resources`;
                const loaded = resources.every(r => r.responseEnd > 0);
                return loaded ? `${type}: Loaded` : `${type}: Some are still loading`;
            }
    
            return {
                stylesheetsInDOM: linkTags,
                styleSheetsLoaded,
                computedStyleApplied: computedStyleCheck,
                mediaStatus: getStatus(mediaResources, "Media"),
                styleStatus: getStatus(styleResources, "Styles"),
                scriptStatus: getStatus(scriptResources, "Scripts"),
                allLoaded: [mediaResources, styleResources, scriptResources].every(arr => arr.every(r => r.responseEnd > 0))
            };
        });
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