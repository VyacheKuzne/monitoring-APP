import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';  // Импортируем PrismaClient

@Injectable()
export class GraphService {
  private prisma = new PrismaClient();  // Создаем экземпляр PrismaClient

  // Метод для получения последних 10 значений loadCPU
  async getStats(): Promise<{ loadCPU: number; usedRAM: string; date: Date }[]> {
    try {
      const stats = await this.prisma.checkServerStats.findMany({
        select: {
          loadCPU: true,
          usedRAM: true,
          date: true,
        },
        orderBy: {
          date: 'desc',
        },
        take: 10,
      });
  
      return stats.map(stat => ({
        ...stat,
        usedRAM: stat.usedRAM?.toString(), // Преобразуем BigInt в строку
      }));
    } catch (error) {
      console.error('Error fetching server stats:', error);
      throw new Error('Could not fetch server stats');
    }
  }  
}
