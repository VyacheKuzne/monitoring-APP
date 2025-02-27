import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhoisModule } from './whois/whois.module';
import { ConfigModule } from '@nestjs/config';
import { SystemModule } from './systeminformation/system.module'; // Import SystemModule
import { testDBModule } from './testDB/testDB.module';
import { SslLabsModule } from './ssl-labs/ssl-labs.module';
import { CpuModule } from './dataForgGrafix/cpu/cpu.module';  // Убедитесь, что добавлен CpuModule
import { DomainModule } from './create/createDomain/createDomain.module';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { CreateServerModule } from './create/create-server/create-server.module';
import { CreateCompanyModule } from './create/create-company/create-company.module';
@Module({
  imports: [WhoisModule,CreateCompanyModule, CreateServerModule, DomainModule, SystemModule, SslLabsModule, CpuModule, PuppeteerModule, ConfigModule.forRoot({ isGlobal: true }), testDBModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
