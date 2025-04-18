import {
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { CreateCompanyService } from './create-company.service';
@Controller('create-company')
export class CreateCompanyController {
  constructor(private readonly CreateCompanyService: CreateCompanyService) {}
  @Post('/company/create')
  async createCompany(@Body() body: { name: string }) {
    return this.CreateCompanyService.createCompany(body.name);
  }
}
