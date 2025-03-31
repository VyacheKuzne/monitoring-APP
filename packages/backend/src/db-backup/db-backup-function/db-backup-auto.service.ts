import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import * as cron from 'node-cron';

@Injectable()
export class DbBackupAutoService {
  private readonly logger = new Logger(DbBackupAutoService.name);
  private backupPath: string = './src/db-backup/backups';

  constructor() {
    // Создаем папку, если её нет
    if (!existsSync(this.backupPath)) {
      mkdirSync(this.backupPath, { recursive: true });
    }

    // Запускаем автоматическое резервное копирование
    this.scheduleBackup();
  }

  /**
   * Ручной запуск бэкапа
   */
  async createBackup(data: {
    password: string;
    user: string;
    database: string;
  }): Promise<void> {
    const fileBackup = `backup_${Date.now()}.sql`;
    const filePath = `${this.backupPath}/${fileBackup}`;

    const dumpCommand = `mysqldump -u${data.user} -p${data.password} ${data.database} > ${filePath}`;

    return new Promise((resolve, reject) => {
      exec(dumpCommand, (error) => {
        if (error) {
          this.logger.error(`Ошибка при бекапе: ${error.message}`);
          return reject(error);
        }
        this.logger.log(`Бекап сохранён: ${filePath}`);
        resolve();
      });
    });
  }

  /**
   * Автоматический запуск бэкапа по расписанию
   */
  private scheduleBackup() {
    cron.schedule('* */3 * * *', () => {
      this.logger.log('Автоматический запуск бэкапа базы данных...');

      const user = 'root';
      const password = '123';
      const database = 'monitoring-app';
      const now = new Date();
      const formattedDate = now
        .toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
        .replace(/[\s,:]/g, '-'); // Заменяем пробелы, двоеточия и запятые
      const fileBackup = `backup_${formattedDate}.sql`;
      const filePath = `${this.backupPath}/${fileBackup}`;

      const dumpCommand = `mysqldump -u${user} -p${password} ${database} > ${filePath}`;

      exec(dumpCommand, (error, stdout, stderr) => {
        if (error) {
          this.logger.error(`Ошибка при выполнении бэкапа: ${error.message}`);
          return;
        }
        if (stderr) {
          this.logger.error(`Ошибка: ${stderr}`);
          return;
        }
        this.logger.log(`Автоматический бэкап выполнен успешно: ${filePath}`);
      });
    });

    this.logger.log(
      'Автоматическое резервное копирование настроено (ежедневно в 2:00).',
    );
  }
}
