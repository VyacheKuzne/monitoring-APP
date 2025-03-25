import { Module } from '@nestjs/common';
import { SslLabsController } from './ssl-labs.controller';
import { SslLabsService } from './ssl-labs.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SslLabsController],
  providers: [SslLabsService],
})
export class SslLabsModule {}
