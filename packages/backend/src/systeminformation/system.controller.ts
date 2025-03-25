import { Controller, Get, Res } from '@nestjs/common';
import { SystemService } from './system.service';
import { Observable, map, catchError } from 'rxjs';
import { Response } from 'express';
import { SystemData } from './interfaces/system-data.interface'; // Импортировать интерфейс, если он используется

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('all')
  getSystemInfo(@Res() res: Response): Observable<void> {
    // Возвращаем Observable<void>, так как данные не возвращаются
    return this.systemService.getSystemData().pipe(
      map((systemData) => {
        if (systemData) {
          // Отправляем ответ и завершаем поток, не возвращаем ничего
          res.status(200).json(systemData); // Ответ отправлен
        } else {
          // Отправляем ошибку, если данные отсутствуют
          res.status(500).json({ message: 'Failed to retrieve system ' }); // Ответ отправлен
        }
        return; // Возвращаем `void`, завершая выполнение
      }),
      catchError((error) => {
        if (!res.headersSent) {
          res
            .status(500)
            .json({ message: 'Failed to retrieve system information', error });
        }
        return new Observable<void>(); // Завершаем поток
      }),
    );
  }
}
