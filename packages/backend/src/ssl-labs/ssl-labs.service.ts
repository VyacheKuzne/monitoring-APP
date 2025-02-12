import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, catchError, tap, last, takeWhile } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { Observable, throwError, interval, of } from 'rxjs';
import { switchMap } from 'rxjs/operators'; // Import switchMap separately
import { SSLInfo, SSLInfoAPI } from './ssl-labs.interfaces';

@Injectable()
export class SslLabsService {
  private readonly logger = new Logger(SslLabsService.name);
  private readonly apiUrl = 'https://api.ssllabs.com/api/v3';

  constructor(private readonly httpService: HttpService) {}

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
    const url = `${this.apiUrl}/analyze?host=${host}`;
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
          })
      );
  }
}