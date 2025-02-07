import { CpuData } from './cpu.interface';
import { DiskData } from './disk.interface';
import { NetworkData } from './network.interface';
import { MemoryData } from './memory.interface';

export interface SystemData {
  cpu: CpuData | null;
  disk: DiskData[] | null;
  network: NetworkData[] | null;
  memory: MemoryData | null;
}