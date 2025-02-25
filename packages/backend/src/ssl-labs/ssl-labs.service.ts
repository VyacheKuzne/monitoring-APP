import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, catchError, tap, last, takeWhile } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { Observable, throwError, interval, of, from } from 'rxjs';
import { switchMap } from 'rxjs/operators'; // Import switchMap separately
import { SSLInfo, SSLInfoAPI, SSLData } from './ssl-labs.interfaces';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SslLabsService {
  private readonly logger = new Logger(SslLabsService.name);
  private readonly apiUrl = 'https://api.ssllabs.com/api/v3';
  private prisma = new PrismaClient();

    constructor(private readonly httpService: HttpService) {}

    // Получение информации об API
    getInfo(): Observable<SSLInfoAPI> {
        const url = `${this.apiUrl}/info`;
        this.logger.log(`Getting SSL Labs Info`);
        return this.httpService.get<SSLInfoAPI>(url).pipe(
        map(response => response.data),
        catchError((error: AxiosError) => {
            this.logger.error(`Error getting SSL Labs Info: ${error.message}`);
            return throwError(() => new Error(error.message));
        }),
        );
    }

  analyze(host: string): Observable<SSLInfo> {
    const url = `${this.apiUrl}/analyze?host=${host}/&all=done`;
    this.logger.log(`Starting SSL Labs analysis for ${host}`);
    return this.httpService.get<SSLInfo>(url).pipe(
      map(response => response.data),
      catchError((error: AxiosError) => {
        this.logger.error(`Error analyzing ${host}: ${error.message}`);
        return throwError(() => new Error(error.message));
      }),
    );
  }

  getAnalysis(host: string): Observable<SSLInfo> {
      return this.analyze(host).pipe(
          switchMap(initialData => {
              if (initialData.status === 'READY') {
                  return of(initialData);
              } else if (initialData.status === 'ERROR') {
                  return throwError(() => new Error(`SSL Labs analysis failed for ${host}`));
              } else {
                  // Poll until analysis is complete
                  return interval(5000).pipe( // Check every 5 seconds
                      switchMap(() => this.analyze(host)),
                      takeWhile(data => data.status !== 'READY' && data.status !== 'ERROR', true),
                      last(),
                      tap(finalData => {
                          if (finalData.status === 'ERROR') {
                              throw new Error(`SSL Labs analysis failed for ${host}`);
                          }
                      }),
                      catchError(err => {
                          this.logger.error(`Error during polling for ${host}: ${err.message}`);
                          return throwError(() => new Error(`Error during polling for ${host}: ${err.message}`));
                      })
                  );
              }
          }),
          switchMap(data => {
            const sslData = this.transformToSslResult(data);
            return from(this.recordSSL(sslData)).pipe(
                map(() => data) // Возвращаем исходные данные после записи
            );
        })      
    );
  }

  private transformToSslResult(data: SSLInfo): SSLData[] {
    // this.logger.debug('Данные из SSL Labs API:', JSON.stringify(data, null, 2));
    if (!data.certs || !Array.isArray(data.certs) || data.certs.length === 0) {
      this.logger.warn('No certificates found in response');
      return [];
    }

    return data.certs.map(cert => {
        const endpoint = data.endpoints[0]; // Берем первый элемент массива
        const versions = endpoint?.details?.protocols.map(protocol => protocol.version).join(', ') || endpoint?.protocol || 'Unknown'; // Собираем версии
      
        return {
          serialNumber: cert.serialNumber || 'Unknown',
          namePublisher: cert.issuerSubject?.split(',').find(part => part.trim().startsWith('CN='))?.replace('CN=', '') || 'Unknown',
          registered: cert.notBefore ? new Date(cert.notBefore) : new Date(data.startTime),
          expires: cert.notAfter ? new Date(cert.notAfter) : new Date(data.testTime),
          fingerprint: cert.sha256Hash || 'Unknown',
          publickey: '', 
          privatekey: '',
          version: versions,
        };
      });
  }

  async recordSSL(data: SSLData[]): Promise<void> {
    try {

        for (const [index, record] of data.entries()) {
            await this.prisma.sSL.upsert({ 
                where: { serialNumber: record.serialNumber  },
                update: record,
                create: record,
            });
        }
        
        this.logger.log('SSL data recorded successfully');
      } 
    catch (error) 
    {
        this.logger.error(`SSL data recording error`);
            throw error;
        }
    }
}