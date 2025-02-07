// src/ssl-labs/ssl-labs.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class SslLabsService {
  private readonly apiUrl = 'https://api.ssllabs.com/api/v3';

  constructor(private readonly httpService: HttpService) {}

  getInfo(): Observable<any> {
    return this.httpService.get(`${this.apiUrl}/info`).pipe(map(response => response.data));
  }

  analyze(
    host: string,
    publish?: boolean,
    startNew?: boolean,
    fromCache?: boolean,
    maxAge?: number,
    all: 'on' | 'done' | null = null,
  ): Observable<any> {
    let url = `${this.apiUrl}/analyze?host=${host}`;
    if (publish) url += '&publish=on';
    if (startNew) url += '&startNew=on';
    if (fromCache) url += '&fromCache=on';
    if (maxAge) url += `&maxAge=${maxAge}`;
    if (all) url += `&all=${all}`;

    return this.httpService.get(url).pipe(map(response => response.data));
  }

  getEndpointData(host: string, s: string): Observable<any> {
    const url = `${this.apiUrl}/getEndpointData?host=${host}&s=${s}`;
    return this.httpService.get(url).pipe(map(response => response.data));
  }

  getStatusCodes(): Observable<any> {
    return this.httpService.get(`${this.apiUrl}/getStatusCodes`).pipe(map(response => response.data));
  }
}