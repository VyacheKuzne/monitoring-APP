import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { catchError, switchMap } from 'rxjs/operators';
import { Observable, throwError, of, from } from 'rxjs'; // Import 'from'
import { ConfigService } from '@nestjs/config';
import { parseString } from 'xml2js'; // Import xml2js

export interface WhoisData {
  domainName: string;
  creationDate?: string;
  expiresDate?: string; // Add expiresDate
  daysToExpire?: number; // Add daysToExpire
}

interface WhoisRecord {
  createdDate?: string;
  updatedDate?: string;
  expiresDate?: string;
  // ... другие поля из XML-ответа ...
}

interface WhoisResponse {
  WhoisRecord?: WhoisRecord;
  ErrorMessage?: {
    // Add field to handle API errors
    code: number;
    msg: string;
  };
}

@Injectable()
export class WhoisService {
  private readonly apiKey: string;
  private readonly baseUrl: string =
    'https://www.whoisxmlapi.com/whoisserver/WhoisService'; // Updated endpoint
  private readonly logger = new Logger(WhoisService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('WHOISXMLAPI_API_KEY') || ''; // Get API key from ConfigService
    if (!this.apiKey) {
      this.logger.warn(
        'WHOISXMLAPI_API_KEY is not set in environment variables. Please set your API key in .env file.',
      );
    }
  }

  getDomainCreationDate(domain: string): Observable<WhoisData> {
    if (!this.apiKey) {
      this.logger.error('API key is not set. Cannot make request.');
      return throwError(() => new Error('API key is not set.'));
    }

    this.logger.debug(`Sending request for domain ${domain}`);

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
            Accept: 'application/xml', // Запрашиваем XML-ответ
          },
        },
      )
      .pipe(
        switchMap((response: AxiosResponse<string>) => {
          // Заменили тип AxiosResponse на string
          this.logger.debug(`Full XML API response received: ${response.data}`); // Логируем XML

          return from(
            new Promise<WhoisData>((resolve, reject) => {
              parseString(response.data, (err, result) => {
                if (err) {
                  this.logger.error(`Error parsing XML: ${err.message}`, err.stack);
                  reject({
                    domainName: domain,
                    creationDate: 'Error parsing XML',
                  });
                  return;
                }

                const whoisRecord = result?.WhoisRecord;
                const createdDate = whoisRecord?.createdDate?.[0];
                const expiresDate = whoisRecord?.expiresDate?.[0];

                this.logger.debug(`Parsed createdDate: ${createdDate}`);
                this.logger.debug(`Parsed expiresDate: ${expiresDate}`);

                let daysToExpire: number | undefined;
                if (expiresDate) {
                  const now = new Date(); // Current date and time
                  const expiry = new Date(expiresDate); // Expiry date and time

                  // Convert both dates to UTC and remove the time part
                  const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
                  const expiryUTC = Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth(), expiry.getUTCDate());

                  // Calculate the difference in milliseconds
                  const diff = expiryUTC - nowUTC;

                  // Convert the difference to days
                  daysToExpire = Math.ceil(diff / (1000 * 3600 * 24));

                  this.logger.debug(`Days to expire: ${daysToExpire}`);
                }

                const whoisData: WhoisData = {
                  domainName: domain,
                  creationDate: createdDate || 'Creation date not found',
                  expiresDate: expiresDate || 'Expiration date not found',
                  daysToExpire: daysToExpire,
                };

                this.logger.debug(`WhoisData: ${JSON.stringify(whoisData)}`);
                resolve(whoisData);
              });
            }),
          );
        }),
        catchError((error) => {
          this.logger.error(
            `Error during Whois API request for domain ${domain}: ${error.message}`,
            error.stack,
          );
          this.logger.error(`Full error object: ${JSON.stringify(error)}`);
          return of({
            domainName: domain,
            creationDate: 'Error during request',
          }); // Wrap in 'of()'
        }),
      );
  }
}