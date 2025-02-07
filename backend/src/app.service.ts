// src/app.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  async getRandomDomain(): Promise<{ domain: string }> {
    try {
      // Замените на более надежный источник случайных доменов!
      const domainList = ['google.com', 'mail.google.com', 'microsoft.com', 'invalid-domain-for-testing.com'];
      const randomIndex = Math.floor(Math.random() * domainList.length);
      return { domain: domainList[randomIndex] };
    } catch (error) {
      console.error('Error getting random domain:', error);
      return { domain: 'mail.google.com' }; // Return a default domain in case of error
    }
  }
}
