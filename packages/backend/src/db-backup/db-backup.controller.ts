import { Controller, Get } from '@nestjs/common';
import { DbBackupService } from './db-backup.service';

@Controller('db-backup')
export class DbBackupController {
  constructor(private readonly dbBackupService: DbBackupService) {}

  @Get('make')
  async makeBackup() {
    await this.dbBackupService.makeBackup('123', 'root', 'monitoring-app'); // ✅ Метод вызывается
    return { message: 'Бекап создан' };
  }
}
