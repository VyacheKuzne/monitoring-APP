import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, forwardRef, Inject, Logger } from '@nestjs/common';
import { DomainService } from './createDomain.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class ProgressGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server; // Ссылка на сервер WebSocket
  private logger: Logger = new Logger('ProgressGateway'); // Логгер для отслеживания соединений

  constructor(
    @Inject(forwardRef(() => DomainService)) // Используем forwardRef
    private readonly domainService: DomainService,
  ) {}

  // Когда клиент подключается, записываем это в лог
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // Когда клиент отключается, записываем это в лог
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Метод, который будет слушать сообщения от клиента и запускать соответствующую обработку
  @SubscribeMessage('startProgress')
  // метод старта
  async StartProgress(
    @MessageBody()
    data: {
      domain: string;
      appName: string;
      idCompany: number;
      serverId: number;
    },
  ) {
    // обьявляем данные
    let progress = 0; // Начальный прогресс
    this.logger.log(`начал работать прогресс бар: ${data.domain}`);

    // Таймер для имитации прогресса
    const interval = setInterval(() => {
      progress += 20;
      this.server.emit('прогресс создания приложения', { progress });

      if (progress >= 100) {
        clearInterval(interval); // Останавливаем таймер, когда прогресс достиг 100%
      }
    }, 1000);

    try {
      // Вызываем функцию из DomainService для создания домена и приложения
      const createdApp = await this.domainService.createDomainAndLinkDomain(
        data.domain,
        data.appName,
        data.idCompany,
        data.serverId,
      );
      // Когда прогресс завершен, отправляем финальное сообщение
      this.server.emit('progress', {
        progress: 100,
        message: 'Приложение успешно созданно',
        app: createdApp,
      });
    } catch (error: any) {
      if (error instanceof Error) {
        this.logger.error(
          `Error processing domain ${data.domain}: ${error.message}`,
        );
        this.server.emit('progress', { progress, error: error.message });
      }
    }
  }

  // Метод для обновления прогресса из DomainService (вызовется при каждом шаге)
  updateProgress(progress: number, message: string) {
    this.server.emit('progress', { progress, message });
  }
}
