import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client'; // Импортируем PrismaClient

@Injectable()
export class GraphService {
  private prisma = new PrismaClient(); // Создаем экземпляр PrismaClient

  // Метод для получения последних 10 значений loadCPU
  async getStats(): Promise<{
    stats: { loadCPU: number; usedRAM: string; received: string; sent: string;  date: Date }[];
    workStatus: number[];
  }> {
    try {
      const hours = 24; // Количество часов для анализа
      // Текущее время, округлённое до ближайшей минуты
      const now = new Date();
      now.setSeconds(0, 0); // Убираем секунды и миллисекунды

      const realTime = 60 * 1000; // Реальное время
      const fiveMinutes = 5 * 60 * 1000; // 5 минут в миллисекундах

      const timestamps: Date[] = [];
      for (let i = 0; i < 298; i++) {
        const time = i < 10 ? realTime : fiveMinutes;
        const timestamp = new Date(now.getTime() - i * time);
        timestamps.push(timestamp);
      }

      const formattedTimestamps = timestamps.map((ts) =>
        ts.toISOString().slice(11, 16) // Достаём только "HH:MM"
      );

      const stats: Array<{ 
        loadCPU: number; 
        usedRAM: string; 
        received: string; 
        sent: string; 
        date: Date 
      }> = await this.prisma.$queryRaw`
        SELECT loadCPU, usedRAM, received, sent, date
        FROM checkserverstats
        WHERE DATE_FORMAT(date, '%H:%i') IN (${Prisma.join(formattedTimestamps)})
          AND date >= ${now.getTime() - hours * 60 * 60 * 1000}
        ORDER BY date DESC
        LIMIT ${288 + 10};
      `;

      console.log(timestamps);
      const workStatus = await this.workStatus(stats, hours, now);

      return {
        stats: stats.map((stat) => ({
          ...stat,
          usedRAM: stat.usedRAM?.toString(),
          received: stat.received?.toString(),
          sent: stat.sent?.toString(),
        })),
        workStatus,
      };
    } catch (error) {
      console.error('Error fetching server stats:', error);
      throw new Error('Could not fetch server stats');
    }
  }

  async workStatus(stats: any[], hours: number, now: Date) {

    const threshold = 2; // Порог количества "нулевых" записей для считать час "плохим"

    // Инициализируем массив статусов для 24 часов
    const workStatus: number[] = new Array(hours).fill(0);
    
    // Объект для подсчёта записей по часам
    const hourlyStats: { [key: number]: { total: number; zeros: number } } = {};
 
    // Обрабатываем все данные
    stats.forEach((stat) => {
      const statDate = new Date(stat.date);
      const hourDiff = Math.floor(
        (now.getTime() - statDate.getTime()) / (60 * 60 * 1000),
      );
  
      if (hourDiff >= 0 && hourDiff < hours) {
        hourlyStats[hourDiff] = hourlyStats[hourDiff] || { total: 0, zeros: 0 };
        hourlyStats[hourDiff].total += 1;
  
        if ((stat.loadCPU || stat.usedRAM || stat.received || stat.sent) === 0) {
          hourlyStats[hourDiff].zeros += 1;
        }
      }
    });

    for (let i = 0; i < hours; i++) {
      const statsForHour = hourlyStats[i] || { total: 0, zeros: 0 };
      workStatus[i] = statsForHour.total === 0 || statsForHour.zeros >= threshold ? 0 : 1;
    }

    return workStatus;
  }
}
