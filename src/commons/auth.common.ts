import { UnauthorizedException } from '@nestjs/common';
import ms from 'ms';
import { ConfigService } from 'src/shared/config/config.service';

const config = new ConfigService();

export function checkTokenExpiry(payload: any): void {
  const now = Date.now();
  const issuedTime = payload?.iat * 1000;
  const expiredTime = payload?.exp * 1000;
  const prevTime = now - Number(ms((config.jwt.expiresIn || '1h') as any));
  const nextTime = now + Number(ms((config.jwt.expiresIn || '1h') as any));
  if (expiredTime <= now || expiredTime >= nextTime || issuedTime <= prevTime) {
    throw new UnauthorizedException('Invalid token expiration');
  }
}

export function extractTokenFromHeader(
  headers: Record<string, string | string[] | undefined>,
): string | undefined {
  const [type, token] = headers.authorization?.toString().split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}
