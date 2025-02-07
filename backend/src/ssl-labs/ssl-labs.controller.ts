// src/ssl-labs/ssl-labs.controller.ts
import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SslLabsService } from './ssl-labs.service';
import { firstValueFrom, timeout } from 'rxjs';

@Controller('ssl-labs') // Добавляем префикс для всех роутов контроллера
export class SslLabsController {
  constructor(private readonly sslLabsService: SslLabsService) {}

  @Get('info') // GET /ssl-labs/info
  async getApiInfo(): Promise<any> {
    try {
      return await firstValueFrom(this.sslLabsService.getInfo());
    } catch (error) {
      throw new HttpException(`Error fetching API info: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('analyze') // GET /ssl-labs/analyze
  async getSslInfo(@Query('host') host: string): Promise<any> {
    if (!host) {
      throw new HttpException('Host parameter is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const analysis = await firstValueFrom(
        this.sslLabsService.analyze(host, false, false, false, undefined, 'done').pipe(
          timeout(60000), // Ограничение по времени выполнения запроса (60 секунд)
        ),
      );

      if (analysis.status === 'ERROR') {
        throw new HttpException(analysis.statusMessage, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const certificate = analysis.endpoints?.[0]?.details?.cert;

      if (certificate) {
        const { subject, issuerSubject, validity } = certificate;
        return {
          host: host,
          subject: subject,
          issuer: issuerSubject,
          validFrom: new Date(validity.notBefore),
          validTo: new Date(validity.notAfter),
          grade: analysis.endpoints?.[0]?.grade,
        };
      } else {
        return {
          host: host,
          message: 'Сертификат не найден или не может быть получен.',
        };
      }

    } catch (error) {
      console.error("Ошибка при получении информации об SSL:", error);
      throw new HttpException(
        `Ошибка при получении информации об SSL: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}