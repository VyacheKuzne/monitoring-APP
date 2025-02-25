import { Controller, Get, Res } from '@nestjs/common';
import { SystemService } from './system.service';
import { Observable, map, catchError } from 'rxjs';
import { Response } from 'express';
import { SystemData } from './interfaces/system-data.interface';  // Импортировать интерфейс, если он используется

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('all')
  getSystemInfo(@Res() res: Response): Observable<SystemData | null> {
    return this.systemService.getSystemData().pipe(
      map((systemData) => {
        if (systemData) {
          res.status(200).json(systemData);  // Отправляем данные, если они получены
          return systemData;
        } else {
          res.status(500).json({ message: 'Failed to retrieve system information' });
          return null;  // Возвращаем null, если данных нет
        }
      }),
      catchError((error) => {
        res.status(500).json({ message: 'Failed to retrieve system information', error });
        return [];
      }),
    );
  }
}
