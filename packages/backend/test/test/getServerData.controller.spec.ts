import { Test, TestingModule } from '@nestjs/testing';
import { RecordStatsService } from '../../src/systeminformation/recordStats.service';
import { PrismaClient } from '@prisma/client';
import { SystemData } from '../../src/systeminformation/interfaces/system-data.interface';

describe('RecordStatsService', () => {
  let recordStatsService: RecordStatsService;
  let prismaClient: PrismaClient;

  beforeAll(() => {
    prismaClient = new PrismaClient(); // создаем экземпляр PrismaClient
  });

  beforeEach(() => {
    recordStatsService = new RecordStatsService(); // создаем сервис
  });

  afterAll(async () => {
    await prismaClient.checkServerStats.deleteMany(); // удаляем все записи, добавленные в тестах
    await prismaClient.$disconnect(); // отключаемся от базы данных
  });

  it('should record and retrieve system stats successfully', async () => {
    const systemData: SystemData = {
      cpu: {
        model: 'Intel',
        currentLoad: 50,
        speed: 3.5, // Пример значения скорости в GHz
        cores: 8, // Пример количества ядер
      },
      memory: {
        total: 16000,
        used: 8000,
        available: 8000,

        free: 3000,
        active: 4000,
      },
      network: [
        {
          iface: 'eth0',
          ip4: '192.168.1.1',
          ip6: 'fe80::1',
          received: 1000,
          sent: 2000,
          speed: 100,
        },
      ],
      disk: [
        {
          device: 'sda1',
          mount: '/',
          type: 'ext4',
          size: 500000,
          used: 250000,
          available: 250000,
          use: 50,
        },
      ],
    };

    // Записываем данные в базу данных
    await recordStatsService.recordStats(systemData);

    // Получаем данные из базы данных
    const savedStats = await prismaClient.checkServerStats.findFirst({
      where: {
        modelCPU: 'Intel',
      },
      include: {
        disk: true, // в случае, если есть связь с дисками
      },
    });

    // Проверяем, что данные были сохранены и можем их получить
    expect(savedStats).not.toBeNull(); // Данные должны быть получены
    expect(savedStats?.modelCPU).toBe('Intel');
    expect(savedStats?.loadCPU).toBe(50);
    expect(savedStats?.totalRAM).toBe(BigInt(16000));
    expect(savedStats?.usedRAM).toBe(BigInt(8000));
    expect(savedStats?.remainingRAM).toBe(BigInt(8000));
    expect(savedStats?.iface).toBe('eth0');
    expect(savedStats?.ip4).toBe('192.168.1.1');
    expect(savedStats?.ip6).toBe('fe80::1');
    expect(savedStats?.received).toBe(BigInt(1000));
    expect(savedStats?.sent).toBe(BigInt(2000));
    expect(savedStats?.speed).toBe(100);

    // Проверка на дисковую информацию
    expect(savedStats?.disk).toHaveLength(1);
    expect(savedStats?.disk[0].device).toBe('sda1');
    expect(savedStats?.disk[0].totalMemory).toBe(BigInt(500000));
    expect(savedStats?.disk[0].usedMemory).toBe(BigInt(250000));
    expect(savedStats?.disk[0].remainingMemory).toBe(BigInt(250000));
    expect(savedStats?.disk[0].loadMemory).toBe(50);
  });
});
