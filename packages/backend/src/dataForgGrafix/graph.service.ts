import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // Импортируем PrismaClient

@Injectable()
export class GraphService {
  private prisma = new PrismaClient(); // Создаем экземпляр PrismaClient

  // Метод для получения последних 10 значений loadCPU
  async getStats(): Promise<
    { loadCPU: number; usedRAM: string; date: Date }[]
  > {
    try {
      const stats = await this.prisma.checkServerStats.findMany({
        where: {
          date: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // >= текущей даты минус 24 часа
          },
        },
        select: {
          loadCPU: true,
          usedRAM: true,
          received: true,
          sent: true,
          date: true,
        },
        orderBy: {
          date: 'desc',
        },
      });

      return stats.map((stat) => ({
        ...stat,
        usedRAM: stat.usedRAM?.toString(), // Преобразуем BigInt в строку
        received: stat.received?.toString(),
        sent: stat.sent?.toString(),
      }));
    } catch (error) {
      console.error('Error fetching server stats:', error);
      throw new Error('Could not fetch server stats');
    }
  }
}
