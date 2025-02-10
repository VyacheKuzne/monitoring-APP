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


@Injectable()
export class SystemService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SystemService.name);

  private cpuData$ = new BehaviorSubject<CpuData | null>(null);
  private diskData$ = new BehaviorSubject<DiskData[] | null>(null);
  private networkData$ = new BehaviorSubject<NetworkData[] | null>(null);
  private memoryData$ = new BehaviorSubject<MemoryData | null>(null);
  private systemData$ = new BehaviorSubject<SystemData | null>(null);

  private intervalSubscription: any;
  private readonly pollingInterval = 60000;

  onModuleInit() {
    this.startMonitoring();
  }

  onModuleDestroy() {
    this.stopMonitoring();
  }

  startMonitoring() {
    this.logger.log(`Starting system monitoring with interval: ${this.pollingInterval}ms`);
    this.intervalSubscription = interval(this.pollingInterval).subscribe(() => {
      this.updateCpuData();
      this.updateDiskData();
      this.updateNetworkData();
      this.updateMemoryData();
    });

    combineLatest([
      this.cpuData$,
      this.diskData$,
      this.networkData$,
      this.memoryData$,
    ]).subscribe(([cpu, disk, network, memory]) => {
      const systemData: SystemData = {
        cpu: cpu,
        disk: disk,
        network: network,
        memory: memory,
      };
      this.systemData$.next(systemData);
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
    from(si.networkInterfaces())
      .pipe(  
        switchMap((interfaces) => {
          const interfacesArray = Array.isArray(interfaces) ? interfaces : [interfaces];

          return from(si.networkStats()).pipe(
            map((stats) => {
              return interfacesArray.map((iface) => {
                const matchingStat = stats.find((stat) => stat.iface === iface.iface);
                return {
                  iface: iface.iface,
                  ip4: iface.ip4,
                  ip6: iface.ip6,
                  speed: iface.speed !== null ? iface.speed : 0,
                  received: matchingStat ? matchingStat.rx_bytes : 0,
                  sent: matchingStat ? matchingStat.tx_bytes : 0,
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