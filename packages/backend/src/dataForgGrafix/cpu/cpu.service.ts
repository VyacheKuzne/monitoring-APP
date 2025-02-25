import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';  // Импортируем PrismaClient

@Injectable()
export class CpuService {
  private prisma = new PrismaClient();  // Создаем экземпляр PrismaClient

  // Метод для получения последних 10 значений loadCPU
  async getCpuStats(): Promise<{ loadCPU: number; date: Date }[]> {
    try {
      // Получаем последние 10 значений loadCPU из таблицы checkServerStats
      const stats = await this.prisma.checkServerStats.findMany({
        select: {
          loadCPU: true,
          date: true,
        },
        orderBy: {
          date: 'desc',  // Сортировка по дате, начиная с самой последней
        },
        take: 10,  // Ограничиваем до 10 самых свежих записей
      });

      return stats;
    } catch (error) {
      console.error('Error fetching CPU stats:', error);
      throw new Error('Could not fetch CPU stats');
    } finally {
      await this.prisma.$disconnect();  // Закрываем соединение с базой данных
    }
  }
}
