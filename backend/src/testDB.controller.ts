// src/app.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { testDBService } from './testDB.service';

@Controller('company')
export class testDBController {
  constructor(private readonly testDBService: testDBService) {}

  @Post('/create')
  async createCompany(@Body() body: { name: string }) {
    return this.testDBService.createCompany(body.name);
  }
  @Get('/get')
  async getCompany() {
    return this.testDBService.getCompany();
  }
  @Patch('/edit/:idCompany')
  async editCompany(@Param('idCompany') idCompany: string, @Body() body: { name: string }) {
    return this.testDBService.editCompany(idCompany, body.name);
  }
  @Delete('/destroy/:idCompany')
  async deleteCompany(@Param('idCompany') idCompany: string) {
    return this.testDBService.deleteCompany(idCompany);
  }
}