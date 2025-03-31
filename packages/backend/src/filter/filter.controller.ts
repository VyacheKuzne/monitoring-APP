import { Body, Controller, Get, Post, Param, Res } from '@nestjs/common';
import { FilterServerStatusService } from './filterServerStatus.service';

@Controller('')
export class FilterController {
  constructor(private readonly filterStatus: FilterServerStatusService) {}

  @Post('companies/filter')
  async filterServerStatus(
    @Body('name') filterName: string,
    @Body('status') filterStatus: boolean[],
  ) {
    console.log(filterName);
    return await this.filterStatus.filterServerStatus(filterName, filterStatus);
  }
}
