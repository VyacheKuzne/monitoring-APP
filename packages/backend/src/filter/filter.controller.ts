import { Body, Controller, Get, Param, Res } from '@nestjs/common';
import { FilterServerStatusService } from './filterServerStatus.service';

@Controller('')
export class FilterController {
  constructor(private readonly filterStatus: FilterServerStatusService) {}

    @Get('companies/filter')
    async filterServerStatus(
        @Body('filterName') filterName: string|null,
        @Body('filterStatus') filterStatus: boolean|null
    ) {
        await this.filterStatus.filterServerStatus(filterName, filterStatus);
    }
}