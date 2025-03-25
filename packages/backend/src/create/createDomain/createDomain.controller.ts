import { Controller, Post, Body } from '@nestjs/common';
import { DomainService } from './createDomain.service';
import { ProgressGateway } from './progress.gateway'; // Импортируем ProgressGateway

@Controller('domain')
export class DomainController {
  constructor(
    private readonly domainService: DomainService,
    private readonly progressGateway: ProgressGateway, // Внедряем зависимость для прогресса
  ) {}

  @Post('create')
  async createDomain(
    @Body()
    Body: {
      name: string;
      appName: string;
      idCompany: number;
      idServer: number;
    },
  ) {
    // Проверяем, что все необходимые параметры есть в теле запроса
    if (!Body.idServer) {
      throw new Error('idServer is required');
    }
    if (!Body.idCompany) {
      throw new Error('idCompany is required');
    }

    // Отправляем сообщение о начале процесса создания домена
    this.progressGateway.server.emit('progress', {
      progress: 0,
      message: 'Начало создания домена',
    });

    try {
      // Выполняем создание домена и приложения
      const createdApp = await this.domainService.createDomainAndLinkDomain(
        Body.name,
        Body.appName,
        Body.idCompany,
        Body.idServer,
      );

      // Если процесс завершился успешно
      this.progressGateway.server.emit('progress', {
        progress: 100,
        message: 'Домен и приложение успешно созданы',
        app: createdApp,
      });

      return createdApp; // Возвращаем результат
    } catch (error) {
      // В случае ошибки, отправляем информацию о сбое
      this.progressGateway.server.emit('progress', {
        progress: 100,
        message: `Ошибка: ${error.message}`,
      });
      throw error; // Перебрасываем ошибку дальше
    }
  }
}
