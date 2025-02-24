    import { Injectable, Logger } from '@nestjs/common';
    import { HttpService } from '@nestjs/axios';
    import { map, catchError, tap, last, takeWhile } from 'rxjs/operators';
    import { AxiosError } from 'axios';
    import { Observable, throwError, interval, of } from 'rxjs';
    import { switchMap } from 'rxjs/operators';
    import { SSLInfo, SSLInfoAPI, SSLEndpoint } from './ssl-labs.interfaces';

    @Injectable()
    export class SslLabsService {
    private readonly logger = new Logger(SslLabsService.name);
    private readonly apiUrl = 'https://api.ssllabs.com/api/v3';

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

    // Запуск анализа SSL для хоста
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

    // Получение результатов анализа с проверкой на готовность
    getAnalysis(host: string): Observable<SSLInfo> {
        return this.analyze(host).pipe(
        switchMap(initialData => {
            if (initialData.status === 'READY') {
            return of(initialData);
            } else if (initialData.status === 'ERROR') {
            return throwError(() => new Error(`SSL Labs analysis failed for ${host}`));
            } else {
            // Периодически проверяем анализ до его завершения
            return interval(5000).pipe( // Проверка каждые 5 секунд
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

    // Получение подробной информации о сертификате SSL
    getDetailedSSLInfo(host: string): Observable<SSLEndpoint[]> {
        return this.getAnalysis(host).pipe(
        map((sslInfo: SSLInfo) => {
            const detailedInfo: SSLEndpoint[] = sslInfo.endpoints.map((endpoint) => ({
                ipAddress: endpoint.ipAddress,
                serverName: endpoint.serverName,
                statusMessage: endpoint.statusMessage,
                grade: endpoint.grade,
                hasWarnings: endpoint.hasWarnings,
                isExceptional: endpoint.isExceptional,
                progress: endpoint.progress,
                duration: endpoint.duration,
                delegation: endpoint.delegation,
                details: endpoint.details, // Используйте details, если оно уже существует в API данных
            }));
            return detailedInfo;
        }),
        catchError((error: AxiosError) => {
            this.logger.error(`Error getting detailed SSL info for ${host}: ${error.message}`);
            return throwError(() => new Error(error.message));
        }),
        );
    }

    // Извлечение деталей сертификата из данных
    private getCertificateDetails(details: any) {
        return {
        certificateIssued: details?.cert?.notBefore || 'N/A',
        certificateExpires: details?.cert?.notAfter || 'N/A',
        issuer: details?.cert?.issuerLabel || 'Unknown',
        publicKeyAlgorithm: details?.cert?.publicKeyAlgorithm || 'N/A',
        keyUsage: details?.cert?.keyUsage || 'N/A',
        signatureAlgorithm: details?.cert?.signatureAlgorithm || 'N/A',
        serialNumber: details?.cert?.serialNumber || 'N/A',
        fingerprints: details?.cert?.fingerprints || 'N/A',
        };
    }
    }
