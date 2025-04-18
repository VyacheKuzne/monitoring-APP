import { Injectable, forwardRef, Logger, Inject } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import * as xml2js from 'xml2js';

@Injectable()
export class PuppeteerCheckFile {

    async checkFile(response) {

        const contentType = response?.headers()['content-type'] || '';
        const fileTypes = [ // Типы файлов которые считаются за файлы, и отменят проверку на стили и тд.
            'application/pdf',
            'image/',
            'audio/',
            'video/',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.oasis.opendocument.text',
            'application/vnd.oasis.opendocument.spreadsheet',
            'application/vnd.oasis.opendocument.presentation',
            'text/plain',
            'text/csv',
            'application/rtf',
            'application/json',
            'application/xml',
        ];

        if (contentType.includes('text/html')) return false;
        return fileTypes.some(type => contentType.includes(type));
    }
};