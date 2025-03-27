import { Injectable, Logger } from '@nestjs/common';
import { DbBackupAutoService } from './db-backup-function/db-backup-auto.service';

@Injectable()
export class DbBackupService {
  private readonly logger = new Logger(DbBackupService.name);
  constructor(private readonly dbBackupAutoService: DbBackupAutoService) {}
  public async makeBackup(password: string, user: string, database: string): Promise<void> {
    this.logger.log('Бекап начался');
    await this.dbBackupAutoService.createBackup({ password, user, database });
    this.logger.log('Бекап завершён');
  }
}
