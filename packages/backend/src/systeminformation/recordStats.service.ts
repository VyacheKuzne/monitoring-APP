import { Injectable, Logger} from '@nestjs/common';
import { SystemData } from './interfaces/system-data.interface';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class RecordStatsService {

    private prisma = new PrismaClient();
    private readonly logger = new Logger(RecordStatsService.name);

    async recordStats(systemData: SystemData) {

        if (systemData.cpu && systemData.memory && systemData.network && systemData.disk)
        {
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
            return result;
        }
        else
        {
            this.logger.error('Data recording error');
            return;
        }
    }
}
