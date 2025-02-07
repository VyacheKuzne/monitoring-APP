import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhoisModule } from './whois/whois.module';
import { ConfigModule } from '@nestjs/config';
import { SslLabsModule } from './ssl-labs/ssl-labs.module';
import { SystemModule } from './systeminformation/system.module'; // Import SystemModule

@Module({
  imports: [WhoisModule, SystemModule, SslLabsModule , ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}