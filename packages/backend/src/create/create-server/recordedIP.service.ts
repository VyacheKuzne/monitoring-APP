import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as dns from 'dns/promises'; // Используем промисовую версию модуля DNS

@Injectable()
export class RecordedIpService {
  private readonly logger = new Logger(RecordedIpService.name);

  // Одна функция для получения IP и локации
  public async getIpAndLocation(hostname: string): Promise<{ ipAddress: string; location: string }> {
    try {
      // Получаем IP-адрес
      const ipAddress = await dns.lookup(hostname).then(res => res.address);
      this.logger.log(`IP-адрес для ${hostname}: ${ipAddress}`);

      // Получаем информацию о местоположении
      const locationData = await axios.get(`http://ip-api.com/json/${ipAddress}`).then(res => res.data);

      // Проверяем статус ответа
      if (locationData.status === 'fail') {
        this.logger.error(`Не удалось получить местоположение для IP: ${ipAddress}`);
        return { ipAddress, location: 'Unknown' };
      }

      const location = `${locationData.city}, ${locationData.country}`;
      this.logger.log(`Местоположение для ${ipAddress}: ${location}`);

      // Возвращаем данные
      return { ipAddress, location };
    } catch (error) {
      this.logger.error(`Ошибка при обработке ${hostname}:`, error);
      throw new Error('Ошибка при получении данных');
    }
  }
}
