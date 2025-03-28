import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SystemStatusService {
  constructor(private readonly httpService: HttpService) {}

  private prisma = new PrismaClient();
  private readonly logger = new Logger(SystemStatusService.name);

    async getSystemStatus(idServer: number) {

        const serverStat = await this.prisma.checkServerStats.findFirst({
            where: {
                // parentServer: idServer // Расскоментировать, когда появятся тексты на каждый сервер 
            },
            orderBy: { date: 'desc', },
        });

        const status: boolean = 
            (serverStat?.loadCPU || serverStat?.usedRAM || (serverStat?.received && serverStat?.sent)) 
            ? true : false;
        return status;
    }
}
