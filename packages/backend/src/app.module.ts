import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhoisModule } from './whois/whois.module';
import { ConfigModule } from '@nestjs/config';
import { SystemModule } from './systeminformation/system.module'; // Import SystemModule
import { testDBModule } from './testDB/testDB.module';
import { SslLabsModule } from './ssl-labs/ssl-labs.module';
import { GraphModule } from './dataForgGrafix/graph.module';
import { DomainModule } from './create/createDomain/createDomain.module';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { CreateServerModule } from './create/create-server/create-server.module';
import { CreateCompanyModule } from './create/create-company/create-company.module';
import { CreateNotificationModule } from './create/create-notification/createNotification.module';

@Module({
  imports: [
    WhoisModule, 
    DomainModule, 
    CreateCompanyModule, 
    CreateServerModule,
    SystemModule, 
    SslLabsModule, 
    GraphModule, 
    PuppeteerModule, 
    ConfigModule.forRoot({ isGlobal: true }),
    CreateNotificationModule,
    testDBModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
