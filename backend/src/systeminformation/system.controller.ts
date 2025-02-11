import { Controller, Get, Res } from '@nestjs/common';
import { SystemService } from './system.service';
import { Observable, map } from 'rxjs';
import { Response } from 'express';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('all')
  getSystemInfo(@Res() res: Response): Observable<void> {
    return this.systemService.getSystemData().pipe(
      map((systemData) => {
        if (systemData) {
          res.status(200).json(systemData);
        } else {
          res.status(500).json({ message: 'Failed to retrieve system information' });
        }
        return; // Return void to satisfy the Observable<void> type
      }),
    );
  }
}