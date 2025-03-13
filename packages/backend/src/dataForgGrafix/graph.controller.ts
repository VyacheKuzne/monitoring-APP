import { Controller, Get } from '@nestjs/common';
import { GraphService } from './graph.service';

@Controller('system')
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  // Эндпоинт для получения всех значений loadCPU
  @Get('stats')
  async getStats() {
    try {
      const stats = await this.graphService.getStats();  // Получаем данные из сервиса
      return stats;  // Отправляем данные в ответе
    } catch (error) {
      console.error('Error fetching server stats:', error);
      return { message: 'Error fetching server stats' };  // Возвращаем ошибку, если не удалось получить данные
    }
  }
}
