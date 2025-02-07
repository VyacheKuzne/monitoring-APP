import { Controller, Get, Param } from '@nestjs/common';
import { WhoisService } from './whois.service';
import { Observable } from 'rxjs';
import { WhoisData } from './whois.service'; // Import WhoisData

@Controller('whois')
export class WhoisController {
    constructor(private readonly whoisService: WhoisService) { }

    @Get(':domain')
    getDomainCreationDate(@Param('domain') domain: string): Observable<WhoisData> {
        return this.whoisService.getDomainCreationDate(domain);
    }
}