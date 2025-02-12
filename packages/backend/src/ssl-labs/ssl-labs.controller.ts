import { Controller, Get, Param, Logger } from '@nestjs/common';
import { SslLabsService } from './ssl-labs.service';
import { Observable } from 'rxjs';
import { SSLInfo, SSLInfoAPI } from './ssl-labs.interfaces';

@Controller('ssl-labs')
export class SslLabsController {
  private readonly logger = new Logger(SslLabsController.name);

  constructor(private readonly sslLabsService: SslLabsService) {}

  @Get('info')
  getInfo(): Observable<SSLInfoAPI> {
    this.logger.log('GET /ssl-labs/info');
    return this.sslLabsService.getInfo();
  }

  @Get('analyze/:host')
  analyze(@Param('host') host: string): Observable<SSLInfo> {
    this.logger.log(`GET /ssl-labs/analyze/${host}`);
    return this.sslLabsService.getAnalysis(host); // Используем getAnalysis
  }
}