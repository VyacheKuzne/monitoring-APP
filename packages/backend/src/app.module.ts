import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhoisModule } from './whois/whois.module';
import { ConfigModule } from '@nestjs/config';
import { SystemModule } from './systeminformation/system.module'; // Import SystemModule
import { testDBModule } from './testDB/testDB.module';
import { SslLabsModule } from './ssl-labs/ssl-labs.module';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
@Module({
  imports: [WhoisModule, SystemModule, SslLabsModule, PuppeteerModule, ConfigModule.forRoot({ isGlobal: true }), testDBModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}