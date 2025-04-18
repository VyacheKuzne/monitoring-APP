import { Module } from '@nestjs/common';
import { CreateCompanyService } from './create-company.service';
import { CreateCompanyController } from './create-company.controller';
@Module({
  controllers: [CreateCompanyController],
  providers: [CreateCompanyService],
})
export class CreateCompanyModule {}
