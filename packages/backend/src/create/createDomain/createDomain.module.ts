import { Module } from '@nestjs/common';
import { DomainService } from './createDomain.service';
import { DomainController } from './createDomain.controller';
import { ProgressGateway } from './progress.gateway';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [DomainController],
  providers: [DomainService, ProgressGateway],
})
export class DomainModule {}
