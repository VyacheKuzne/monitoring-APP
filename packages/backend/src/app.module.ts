import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhoisModule } from './whois/whois.module';
import { ConfigModule } from '@nestjs/config';
import { SystemModule } from './systeminformation/system.module'; // Import SystemModule
import { testDBModule } from './testDB/testDB.module';
import { SslLabsModule } from './ssl-labs/ssl-labs.module';
@Module({
  imports: [WhoisModule, SystemModule, SslLabsModule , ConfigModule.forRoot({ isGlobal: true }), testDBModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}