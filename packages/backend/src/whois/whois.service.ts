import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { catchError, switchMap } from 'rxjs/operators';
import { Observable, throwError, of, from } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { parseString } from 'xml2js';
import { PrismaClient } from '@prisma/client';

export interface WhoisData {
    domainName: string;
    creationDate?: Date | string;
    updatingDate?: Date | string;
    expiresDate?: Date | string;
    registrarName?: string;
    ownerName?: string;

    daysToExpire?: number;
}

interface WhoisRecord {
    createdDate?: string;
    updatedDate?: string;
    expiresDate?: string;
    registrarName?: string;
    registrant?: {
        organization?: string;
    };
    registryData?: [{
        createdDate?: string;
        expiresDate?: string;
    }];
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
    private prisma = new PrismaClient(); // Создаём Prisma клиент

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('WHOISXMLAPI_API_KEY') || '';
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
                        Accept: 'application/xml',
                    },
                },
            )
            .pipe(
                switchMap((response: AxiosResponse<string>) => {
                    // this.logger.debug(`Full XML API response received: ${response.data}`);
                    return from(
                        new Promise<WhoisData>((resolve, reject) => {
                            parseString(response.data, (err, result: WhoisResponse) => {
                                if (err) {
                                    this.logger.error(`Error parsing XML: ${err.message}`, err.stack);
                                    reject({ 
                                        domainName: domain, 
                                        creationDate: undefined, 
                                        updatedDate: undefined,
                                        expiresDate: undefined,
                                        registrarName: undefined,
                                        organization: undefined,
                                        daysToExpire: undefined 
                                    });
                                    return;
                                }

                                const whoisRecord = result?.WhoisRecord;
                                const registryData = result?.WhoisRecord?.registryData?.[0];

                                // Пытаемся извлечь данные из WhoisRecord, если не нашли — ищем в registryData
                                const createdDate = whoisRecord?.createdDate?.[0] || registryData?.createdDate?.[0] || undefined;
                                const updatedDate = whoisRecord?.updatedDate?.[0] || undefined;
                                const expiresDate = whoisRecord?.expiresDate?.[0] || registryData?.expiresDate?.[0] || undefined;
                                const registrarName = whoisRecord?.registrarName?.[0] || undefined;
                                const organization = whoisRecord?.registrant?.organization?.[0] || undefined;

                                let daysToExpire: number | undefined;
                                if (expiresDate) {
                                  const now = new Date();
                                  const expiry = new Date(expiresDate);
                
                                  const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
                                  const expiryUTC = Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth(), expiry.getUTCDate());
                
                                  const diff = expiryUTC - nowUTC;
                                  daysToExpire = Math.ceil(diff / (1000 * 3600 * 24));
                                }

                                function replace(rawDate: string): Date {
                                    const formattedDate = new Date(rawDate.replace("+0000", "Z"));
                                    return formattedDate;
                                }

                                const whoisData: WhoisData = {
                                    domainName: domain,
                                    creationDate: createdDate ? replace(createdDate) : undefined,
                                    updatingDate: updatedDate ? replace(updatedDate) : undefined,
                                    expiresDate: expiresDate ? replace(expiresDate) : undefined,
                                    registrarName: registrarName,
                                    ownerName: organization,

                                    daysToExpire: daysToExpire
                                };

                                // this.logger.debug(`WhoisData: ${JSON.stringify(whoisData)}`);
                                resolve(whoisData);

                                this.createDomain(whoisData);
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
                    });
                }),
            );
    }

    async createDomain(whoisData: WhoisData): Promise<void> {
        
        if(whoisData)
        {
            await this.prisma.domain.upsert({
                where: {
                    name: whoisData.domainName,
                },
                update: {
                    registered: whoisData.creationDate instanceof Date ? whoisData.creationDate.toISOString() : whoisData.creationDate,
                    updated: whoisData.updatingDate instanceof Date ? whoisData.updatingDate.toISOString() : whoisData.updatingDate,
                    expires: whoisData.expiresDate instanceof Date ? whoisData.expiresDate.toISOString() : whoisData.expiresDate,
                    nameRegistar: whoisData.registrarName,
                    nameOwner: whoisData.ownerName,
                },
                create: {
                    name: whoisData.domainName,
                    registered: whoisData.creationDate instanceof Date ? whoisData.creationDate.toISOString() : whoisData.creationDate,
                    updated: whoisData.updatingDate instanceof Date ? whoisData.updatingDate.toISOString() : whoisData.updatingDate,
                    expires: whoisData.expiresDate instanceof Date ? whoisData.expiresDate.toISOString() : whoisData.expiresDate,
                    nameRegistar: whoisData.registrarName,
                    nameOwner: whoisData.ownerName,
                },
            });

            this.logger.log(`Whois data ${whoisData.domainName} recorded successfully`);
            await this.whoisNotification(whoisData);
        }
        else
        {
            this.logger.error(`Whois data recording error`);
        }
    }

    async whoisNotification(whoisData: WhoisData)
    {
        if(whoisData.daysToExpire && whoisData.daysToExpire <= 30)
        {
            const url = 'http://localhost:3000/notification/create';
            const data = {
                text: `Срок действия домена ${whoisData.domainName}, истекает через ${whoisData.daysToExpire} дней`,
                parentCompany: null,
                parentServer: null,
                parentApp: null,
              };
              await this.httpService.post(url, data).toPromise();
        }
    }
}
