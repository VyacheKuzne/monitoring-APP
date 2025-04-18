import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client'; // Импортируем PrismaClient

@Injectable()
export class GraphService {
  private prisma = new PrismaClient(); // Создаем экземпляр PrismaClient

  // Метод для получения последних 10 значений loadCPU
  async getStats(): Promise<{
    stats: {
      loadCPU: number;
      usedRAM: string;
      received: string;
      sent: string;
      date: Date;
    }[];
    workStatus: number[];
  }> {
    try {
      const hours = 24; // Количество часов для анализа
      // Текущее время, округлённое до ближайшей минуты
      const now = new Date();
      now.setSeconds(0, 0); // Убираем секунды и миллисекунды

      const realTime = 60000; // 1 минута в миллисекундах
      const fiveMinutes = 300000; // 5 минут в миллисекундах

      const timestamps: Date[] = [];
      for (let i = 0; i < 298; i++) {
        let offset;
        if (i < 10) {
          // Первые 10 элементов с интервалом 1 минута
          offset = i * realTime;
        } else {
          // После 10-го элемента: 9 минут уже прошли, затем 5-минутные шаги
          const fiveMinuteSteps = i - 8; // Сдвиг на 8
          offset = 8 * realTime + (fiveMinuteSteps - 1) * fiveMinutes;
        }
        const timestamp = new Date(now.getTime() - offset);
        timestamps.push(timestamp);
      }

      const formattedTimestamps = timestamps.map(
        (ts) => ts.toISOString().slice(11, 16), // Достаём только "HH:MM"
      );

      const stats: Array<{
        loadCPU: number;
        usedRAM: string;
        received: string;
        sent: string;
        date: Date;
      }> = await this.prisma.$queryRaw`
        SELECT loadCPU, usedRAM, received, sent, date
        FROM checkserverstats
        WHERE DATE_FORMAT(date, '%H:%i') IN (${Prisma.join(formattedTimestamps)})
          AND date >= ${now.getTime() - hours * 60 * 60 * 1000}
        ORDER BY date DESC
        LIMIT ${288 + 10};
      `;

      const filteredStats = stats.filter((stat) => {
        const statDate = new Date(stat.date);
        const now = new Date();
        return statDate >= new Date(now.getTime() - hours * 60 * 60 * 1000);
      });

      const workStatus = await this.workStatus(filteredStats, hours, now);

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
      const nowHour = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        0,
        0,
      );
      const statHour = new Date(
        stat.date.getFullYear(),
        stat.date.getMonth(),
        stat.date.getDate(),
        stat.date.getHours(),
        0,
        0,
      );

      const hourDiff = Math.floor(
        (nowHour.getTime() - statHour.getTime()) / (60 * 60 * 1000),
      );

      if (hourDiff >= 0 && hourDiff < hours) {
        const invertedIndex = hours - 1 - hourDiff;
        hourlyStats[invertedIndex] = hourlyStats[invertedIndex] || {
          total: 0,
          zeros: 0,
        };
        hourlyStats[invertedIndex].total += 1;

        if (
          (stat.loadCPU || stat.usedRAM || (stat.received && stat.sent)) === 0
        ) {
          hourlyStats[invertedIndex].zeros += 1;
        }
      }
    });

    for (let i = 0; i < hours; i++) {
      const statsForHour = hourlyStats[i] || { total: 0, zeros: 0 };
      workStatus[i] =
        statsForHour.total === 0 || statsForHour.zeros >= threshold ? 0 : 1;
    }

    return workStatus;
  }
}
