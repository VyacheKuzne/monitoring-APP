import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhoisModule } from './whois/whois.module';
import { ConfigModule } from '@nestjs/config';
import { SystemModule } from './systeminformation/system.module'; // Import SystemModule
import { testDBModule } from './testDB/testDB.module';
import { SslLabsModule } from './ssl-labs/ssl-labs.module';
import { GraphModule } from './dataForgGrafix/graph.module';
import { DomainModule } from './create/createDomain/createDomain.module'; // Import DomainModule here
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { CreateServerModule } from './create/create-server/create-server.module';
import { CreateCompanyModule } from './create/create-company/create-company.module';
import { CreateNotificationModule } from './create/create-notification/createNotification.module';
import { FrequencyTestModule } from './frequency-test/frequency-test.module';

@Module({
  imports: [
    WhoisModule,
    DomainModule, // DomainModule is imported here, which includes ProgressGateway
    CreateCompanyModule,
    CreateServerModule,
    SystemModule,
    SslLabsModule,
    GraphModule,
    PuppeteerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CreateNotificationModule,
    testDBModule,
    // FrequencyTestModule,
  ],
  controllers: [AppController],
  providers: [AppService], // ProgressGateway is automatically provided by DomainModule, so no need to add it here
})
export class AppModule {}
