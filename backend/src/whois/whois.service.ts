import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { catchError, switchMap } from 'rxjs/operators';
import { Observable, throwError, of, from } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { parseString } from 'xml2js';

export interface WhoisData {
  name: string;
  registered?: string;
  expires?: string;
  daysToExpire?: number; // Оставлено закомментированным для будущего использования
}

interface WhoisRecord {
  createdDate?: string;
  updatedDate?: string;
  expiresDate?: string;
}

interface WhoisResponse {
  WhoisRecord?: WhoisRecord;
  ErrorMessage?: {
    code: number;
    msg: string;
  };
}

@Injectable()
export class WhoisService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://www.whoisxmlapi.com/whoisserver/WhoisService';
  private readonly logger = new Logger(WhoisService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('WHOISXMLAPI_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('WHOISXMLAPI_API_KEY is not set in environment variables.');
    }
  }

  getDomainCreationDate(domain: string): Observable<WhoisData> {
    if (!this.apiKey) {
      this.logger.error('API key is not set.');
      return throwError(() => new Error('API key is not set.'));
    }

    return this.httpService
      .post(
        this.baseUrl,
        {
          domainName: domain,
          apiKey: this.apiKey,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/xml',
          },
        },
      )
      .pipe(
        switchMap((response: AxiosResponse<string>) => {
          return from(
            new Promise<WhoisData>((resolve, reject) => {
              parseString(response.data, (err, result) => {
                if (err) {
                  this.logger.error(`XML parsing error: ${err.message}`, err.stack);
                  reject({ name: domain, registered: 'Parse error' });
                  return;
                }

                const whoisRecord = result?.WhoisRecord;
                const createdDate = whoisRecord?.createdDate?.[0];
                const expiresDate = whoisRecord?.expiresDate?.[0];

                // Закомментированный расчет дней до истечения
                /*
                let daysToExpire: number | undefined;
                if (expiresDate) {
                  const now = new Date();
                  const expiry = new Date(expiresDate);
                  const nowUTC = Date.UTC(
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate()
                  );
                  const expiryUTC = Date.UTC(
                    expiry.getUTCFullYear(),
                    expiry.getUTCMonth(),
                    expiry.getUTCDate()
                  );
                  daysToExpire = Math.ceil((expiryUTC - nowUTC) / (1000 * 3600 * 24));
                }
                */

                resolve({
                  name: domain,
                  registered: createdDate || 'Date not found',
                  expires: expiresDate || 'Date not found',
                  // daysToExpire // Раскомментировать при необходимости
                });
              });
            }),
          );
        }),
        catchError((error) => {
          this.logger.error(`API request failed for ${domain}: ${error.message}`, error.stack);
          return of({ name: domain, registered: 'Request error' });
        }),
      );
  }
}