import { Module } from '@nestjs/common';
import { WhoisService } from './whois.service';
import { WhoisController } from './whois.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [WhoisService],
  controllers: [WhoisController],
})
export class WhoisModule {}
