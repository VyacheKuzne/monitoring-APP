import { Injectable, Logger } from '@nestjs/common';
import { SystemData } from './interfaces/system-data.interface';
import prisma from '../../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { NotificationService } from '../create/create-notification/createNotification.service';

@Injectable()
export class RecordStatsService {
  constructor(
    private readonly NotificationService: NotificationService,
  ) {}

  private prisma = prisma;
  private readonly logger = new Logger(RecordStatsService.name);

  private timer = 600000; // Миллисекунды
  private percent = 90;
  private reductionRatio = 0.8; // Коэффициент выхода из

  private highLoadStartTime: number | null = null;
  private initialNotificationSent = false;
  private lastHourlyReminder: number | null = null;

  async recordStats(systemData: SystemData) {
    if (
      systemData.cpu &&
      systemData.memory &&
      systemData.network &&
      systemData.disk
    ) {
      const result = await this.prisma.checkServerStats.create({
        data: {
          modelCPU: systemData.cpu?.model ?? '',
          loadCPU: systemData.cpu?.currentLoad ?? 0,
          totalRAM: BigInt(systemData.memory?.total || 0),
          usedRAM: BigInt(systemData.memory?.used || 0),
          remainingRAM: BigInt(systemData.memory?.available || 0),
          iface: systemData.network?.[0]?.iface || '',
          ip4: systemData.network?.[0]?.ip4 || '',
          ip6: systemData.network?.[0]?.ip6 || '',
          received: BigInt(systemData.network?.[0]?.received || 0),
          sent: BigInt(systemData.network?.[0]?.sent || 0),
          speed: systemData.network?.[0]?.speed || 0,

          date: new Date(),

          disk: {
            create: systemData.disk.map((d) => ({
              device: d.device || 'N/A',
              mount: d.mount || '',
              type: d.type || '',
              totalMemory: BigInt(d.size || 0),
              usedMemory: BigInt(d.used || 0),
              remainingMemory: BigInt(d.available || 0),
              loadMemory: d.use || 0,
            })),
          },
        },
      });

      this.logger.log(`Monitoring data recorded successfully`);
      await this.statsNotification(systemData.cpu.currentLoad);
      return result;
    } else {
      this.logger.error('Monitoring data recording error');
      return;
    }
  }
  async statsNotification(currentLoad: number) {
    const thresholdDrop = this.percent * this.reductionRatio;
    const hour = 3600000;

    if (currentLoad < thresholdDrop && this.highLoadStartTime !== null) {
      this.highLoadStartTime = null;
    }

    if (currentLoad >= this.percent && this.highLoadStartTime === null) {
      this.highLoadStartTime = Date.now();
    }

    if (this.highLoadStartTime !== null) {
      const timeDifference = Date.now() - this.highLoadStartTime;

      if (timeDifference >= this.timer && !this.initialNotificationSent) {
        this.NotificationService.createNotification({
          text: `Сервер в нагрузке свыше ${this.percent}%, уже дольше ${(this.timer / 60000).toFixed(0)} минут.`,
          parentCompany: 1,
          parentServer: 1,
          parentApp: null,
          status: 'warning',
          date: new Date()
        });
        this.initialNotificationSent = true;
      }
      if (timeDifference >= hour) {
        const hoursElapsed = Math.floor(timeDifference / hour); // Количество полных часов
        const nextReminderTime = this.highLoadStartTime + hoursElapsed * hour;
        if (
          this.lastHourlyReminder === null ||
          nextReminderTime > this.lastHourlyReminder
        ) {
          this.NotificationService.createNotification({
            text: `Сервер в нагрузке свыше ${this.percent}%, уже дольше ${hoursElapsed} часов`,
            parentCompany: 1,
            parentServer: 1,
            parentApp: null,
            status: 'alert',
            date: new Date()
          });
          this.lastHourlyReminder = nextReminderTime; // Обновляем время последнего напоминания
        }
      }
    }
  }
}
