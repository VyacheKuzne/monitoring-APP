import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // Импортируем PrismaClient
import { HttpService } from '@nestjs/axios';

@Injectable()
export class FilterServerStatusService {
    constructor(private readonly httpService: HttpService) {}
    private prisma = new PrismaClient(); // Создаем экземпляр PrismaClient

  // 
    async filterServerStatus(
        filterName: string|null, 
        filterStatus: boolean|null
    ): Promise<{ 
        // Company: null, 
        Status: boolean[]
    }> {

        const filters = await this.prisma.company.findMany({
            where: {
                name: filterName && filterName.trim() !== "" ? filterName : undefined
            },
            select: {
                name: true,
                server: {
                select: {
                    idServer: true
                }
                }
            }
        });

        const responseStatus: boolean[] = await Promise.all(
            filters.map(async (company) => {
                if(company.server && company.server.length > 0 && company.server[0]?.idServer) {

                    const url = `http://localhost:3000/system/status/${company.server[0].idServer}`;
                    const response = await this.httpService.get(url).toPromise();
                    return response?.data;
                }
                else {
                    return false
                }
            })
        );

        console.log(responseStatus);

        return {
            Status: responseStatus
        };
    } 
}