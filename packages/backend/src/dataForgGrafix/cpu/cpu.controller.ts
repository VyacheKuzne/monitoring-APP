import { Controller, Get } from '@nestjs/common';
import { CpuService } from './cpu.service';

@Controller('system')
export class CpuController {
  constructor(private readonly cpuService: CpuService) {}

  // Эндпоинт для получения всех значений loadCPU
  @Get('cpu-stats')
  async getCpuStats() {
    try {
      const stats = await this.cpuService.getCpuStats();  // Получаем данные из сервиса
      return stats;  // Отправляем данные в ответе
    } catch (error) {
      console.error('Error fetching CPU stats:', error);
      return { message: 'Error fetching CPU stats' };  // Возвращаем ошибку, если не удалось получить данные
    }
  }
}
