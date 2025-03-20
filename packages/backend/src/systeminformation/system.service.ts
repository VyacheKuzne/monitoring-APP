import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as si from 'systeminformation';
import { Observable, from, catchError, of, switchMap, interval, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CpuData } from './interfaces/cpu.interface';
import { DiskData } from './interfaces/disk.interface';
import { NetworkData } from './interfaces/network.interface';
import { MemoryData } from './interfaces/memory.interface';
import { SystemData } from './interfaces/system-data.interface';
import { timeout } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { RecordStatsService } from './recordStats.service';

@Injectable()
export class SystemService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly recordStats: RecordStatsService) {}
  private readonly logger = new Logger(SystemService.name);

  private cpuData$ = new BehaviorSubject<CpuData | null>(null);
  private diskData$ = new BehaviorSubject<DiskData[] | null>(null);
  private networkData$ = new BehaviorSubject<NetworkData[] | null>(null);
  private memoryData$ = new BehaviorSubject<MemoryData | null>(null);
  private systemData$ = new BehaviorSubject<SystemData | null>(null);

  private intervalSubscription: any;
  private readonly pollingInterval = 60000;
  private DelayTime = 5000;

  private previousStats: { [iface: string]: Pick<NetworkData, 'received' | 'sent'> } = {};

  onModuleInit() {
    this.startMonitoring();
  }

  onModuleDestroy() {
    this.stopMonitoring();
  }

  startMonitoring() {
    this.logger.log(`Starting system monitoring with interval: ${this.pollingInterval}ms`);
    
    // 1. Запускаем интервал для обновления данных
    this.intervalSubscription = interval(this.pollingInterval).subscribe(() => {
      this.updateCpuData();  // Обновляем данные процессора
      this.updateDiskData(); // Обновляем данные диска
      this.updateNetworkData(); // Обновляем данные сети
      this.updateMemoryData(); // Обновляем данные памяти
    });
  
    // 2. Объединяем все данные и обрабатываем их
    combineLatest([
      this.cpuData$,
      this.diskData$,
      this.networkData$,
      this.memoryData$,
    ])
      .pipe(
        // Задержка перед обработкой данных (debounceTime)
        debounceTime(this.DelayTime),
        // Преобразуем данные в объект SystemData
        map(([cpu, disk, network, memory]) => ({
          cpu,
          disk,
          network,
          memory,
        }))
      )
      .subscribe((systemData) => {
        // 3. Сохраняем данные в базе
        this.recordStats.recordStats(systemData); // Передаем в сервис базы данных
  
        // 4. Отправляем данные на клиентскую сторону (например, через WebSocket или другие механизмы)
        this.systemData$.next(systemData); // Публикуем данные для вывода на страницу
      });
  }

  stopMonitoring() {
    this.logger.log('Stopping system monitoring');
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  // --- CPU ---
  private updateCpuData() {
    this.logger.debug('Getting CPU information...');
    from(si.cpuCurrentSpeed())
      .pipe(  
        switchMap((speed) =>
          from(si.cpu()).pipe(
            map((cpu) => ({
              model: cpu.manufacturer + ' ' + cpu.brand,
              speed: speed.avg,
              cores: cpu.cores,
              currentLoad: 0,
            })),
          ),
        ),
        switchMap((cpuData) =>
          from(si.currentLoad()).pipe(
            map((load) => ({
              ...cpuData,
              currentLoad: load.currentLoad,
            })),
          ),
        ),
        catchError((err) => {
          this.logger.error('Error getting CPU info:', err);
          return of(null);
        }),
      )
      .subscribe((data) => {
        if (data) {
          this.cpuData$.next(data);
        }
      });
  }

  // --- DISK ---
  private updateDiskData() {
    this.logger.debug('Getting Disk information...');
    from(si.fsSize())
      .pipe(  
        map((disks) =>
          disks.map((disk) => {
            // Use type assertion to tell TypeScript that disk has a device property
            const diskWithDevice = disk as { device?: string };
            return {
              device: diskWithDevice.device || 'N/A', // Use the asserted type
              mount: disk.mount,
              type: disk.type,
              size: disk.size,
              used: disk.used,
              available: disk.available,
              use: disk.use,
            };
          }),
        ),
        catchError((err) => {
          this.logger.error('Error getting Disk info:', err);
          return of(null);
        }),
      )
      .subscribe((data) => {
        if (data) {
          this.diskData$.next(data);
        }
      });
  }

  // --- NETWORK ---
  private updateNetworkData() {
    this.logger.debug('Getting Network information...');
    from(si.networkInterfaces())
      .pipe(  
        switchMap((interfaces) => {
          const interfacesArray = Array.isArray(interfaces) ? interfaces : [interfaces];

          return from(si.networkStats()).pipe(
            map((stats) => {
              return interfacesArray.map((iface) => {
                const matchingStat = stats.find((stat) => stat.iface === iface.iface);

                const currentReceived = matchingStat ? matchingStat.rx_bytes : 0;
                const currentSent = matchingStat ? matchingStat.tx_bytes : 0;
                const previousReceived = this.previousStats[iface.iface]?.received ?? 0n;
                const previousSent = this.previousStats[iface.iface]?.sent ?? 0n;
                
                this.previousStats[iface.iface] = {
                  received: currentReceived,
                  sent: currentSent,
                };
                
                return {
                  iface: iface.iface,
                  ip4: iface.ip4,
                  ip6: iface.ip6,
                  speed: iface.speed !== null ? iface.speed : 0,
                  received: currentReceived - previousReceived, // Разница между нынешним и предыдущим значением
                  sent: currentSent - previousSent,
                };
              });
            }),
          );
        }),
        catchError((err) => {
          this.logger.error('Error getting Network info:', err);
          return of(null);
        }),
      )
      .subscribe((data) => {
        if (data) {
          this.networkData$.next(data as any);
        }
      });
  }

  // --- MEMORY ---
  private updateMemoryData() {
    this.logger.debug('Getting memory information...');
    from(si.mem())
      .pipe(  
        map((memory) => ({
          total: memory.total,
          free: memory.free,
          used: memory.used,
          active: memory.active,
          available: memory.available,
        })),
        catchError((err) => {
          this.logger.error('Error getting memory info:', err);
          return of(null);
        }),
      )
      .subscribe((data) => {
        if (data) {
          this.memoryData$.next(data);
        }
      });
  }

  // --- Aggregated System Data ---
  getSystemData(): Observable<SystemData | null> {
    return this.systemData$.asObservable();
  }
}