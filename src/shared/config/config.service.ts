import { Injectable } from '@nestjs/common';

import ms = require('ms');

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

  get google() {
    return {
      clientId: this.get('GOOGLE_CLIENT_ID'),
      clientSecret: this.get('GOOGLE_CLIENT_SECRET'),
    };
  }

  get forgotPassword() {
    return {
      url: this.get('FORGOT_PASSWORD_URL'),
      hybridMarketerUrl: this.get('HYBRID_MARKETER_FORGOT_PASSWORD_URL'),
    };
  }

  get forbiddenSubdomains() {
    return {
      forbidden: this.get("SUBDOMAIN_BLACKLIST")
    };
  }

  get s3() {
    return {
      endpoint: this.get('S3_ENDPOINT'),
      accessKeyId: this.get('S3_ACCESS_KEY'),
      secretAccessKey: this.get('S3_SECRET_KEY'),
      region: this.get('S3_REGION'),
      bucketName: this.get('S3_BUCKET_NAME'),
    };
  }

  get googleRecaptcha() {
    return {
      secretKey: this.get('GOOGLE_RECAPTCHA_SECRET_KEY'),
    };
  }

  get getManagementUserRegisterLogin() {
    return {
      url: this.get('MANAGEMENT_USER_REGISTER_LOGIN_URL'),
      login: this.get('MANAGEMENT_USER_LOGIN')
    };
  }

  get loginHybridMarketer() {
    return {
      url: this.get('HYBRID_MARKETER_LOGIN_URL'),
    };
  }
}
