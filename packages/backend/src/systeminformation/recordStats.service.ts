import { Injectable } from '@nestjs/common';
import { SystemData } from './interfaces/system-data.interface';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class RecordStatsService {

    private prisma = new PrismaClient();

    async recordStats(systemData: SystemData) {
        return this.prisma.checkServerStats.create({
        data: 
        {
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

            // countProcesses: ,
            // countErrors: ,
        }})
    }
}
