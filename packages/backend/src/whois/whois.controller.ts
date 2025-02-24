  import { Controller, Get, Query, Inject } from '@nestjs/common';  // Import Query
  import { WhoisService, WhoisData } from './whois.service'; // Import WhoisService and WhoisData
  import { Observable } from 'rxjs';

  @Controller('whois')
  export class WhoisController {
    constructor(private readonly whoisService: WhoisService) {}

    @Get()
    getWhoisData(@Query('domain') domain: string): Observable<WhoisData> {  // Get domain from query parameter
      return this.whoisService.getDomainCreationDate(domain);
    }
  }