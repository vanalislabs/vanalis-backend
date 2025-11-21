import { Injectable } from '@nestjs/common';

import ms from 'ms';

@Injectable()
export class ConfigService {
  constructor() {
    for (const envName of Object.keys(process.env)) {
      process.env[envName] = process?.env?.[envName]?.replace(/\\n/g, '\n');
    }
  }

  public get(key: string): string {
    return process.env[key] || '';
  }

  public getNumber(key: string): number {
    return Number(this.get(key));
  }

  get app() {
    return {
      host: this.get('HOST') || 'localhost',
      port: this.get('PORT') || 4000,
      url: this.get('APP_URL') || '',
    };
  }

  get auth() {
    return {
      otpExpiry: Number(ms((this.get('OTP_EXPIRY') || '5m') as any)),
    };
  }

  get jwt() {
    return {
      secret: this.get('JWT_SECRET'),
      expiresIn: this.get('JWT_EXPIRES_IN') || '1h',
    };
  }

  get indexer() {
    return {
      pollingInterval: this.getNumber('INDEXER_POLLING_INTERVAL') || 1000,
    }
  }
}
