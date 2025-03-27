import { Module } from '@nestjs/common';
import { DbBackupService } from './db-backup.service';
import { DbBackupController } from './db-backup.controller';
import { DbBackupAutoService } from './db-backup-function/db-backup-auto.service';

@Module({
  controllers: [DbBackupController],
  providers: [DbBackupService, DbBackupAutoService],
  exports: [DbBackupService, DbBackupAutoService], 
})
export class DbBackupModule {}
