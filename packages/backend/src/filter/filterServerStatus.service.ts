import { Logger, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class FilterServerStatusService {
    constructor(private readonly httpService: HttpService) {}
    private prisma = new PrismaClient();
    private readonly logger = new Logger(FilterServerStatusService.name);

    async filterServerStatus(
        filterName: string, 
        filterStatus: boolean[]
    ): Promise<{ 
        company: { idCompany: number; name: string; server: { idServer: number }[] }[], 
        status: boolean[]
    }> {
        // Получаем компании из БД
        const companies = await this.prisma.company.findMany({
            where: {
                name: { contains: filterName }
            },
            select: {
                idCompany: true,
                name: true,
                server: {
                    select: {
                        idServer: true
                    }
                }
            }
        });

        // Массив статусов
        const statuses: boolean[] = await Promise.all(
            
            companies.map(async (company) => {
                let okay = 0;
                let notOkay = 0;

                if (company.server.length > 0 && company.server[0]?.idServer) {
                    await Promise.all(
                        company.server.map(async (server) => {
                            const url = `http://localhost:3000/system/status/${server.idServer}`;
                            const response = await this.httpService.get(url).toPromise();
                            if (response) {
                              okay++;  // Увеличиваем if статус успешный
                              return true;
                            }
                            else {
                              notOkay++;  // Увеличиваем если response не пришёл
                              return false;
                            }
                        })
                    );
                    const result = okay > notOkay ? true : false;
                    return result;
                }
                return false;
            })
        );

        let filterStatuses = [...statuses];

        for (let i = statuses.length - 1; i >= 0; i--) { // Удаляем компании по статусам
            if (
                (filterStatus[0] && statuses[i] === false) ||  // Фильтруем по статусу false
                (filterStatus[1] && statuses[i] === true)     // Фильтруем по статусу true
            ) {
                companies.splice(i, 1);
                filterStatuses.splice(i, 1);
            }
        }

        // Возвращаем объект с компаниями и их статусами
        return {
            company: companies,
            status: filterStatuses
        };
    }
}
