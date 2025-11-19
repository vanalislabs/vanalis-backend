import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../shared/prisma/prisma.service';
import { checkTokenExpiry, extractTokenFromHeader } from 'src/commons/auth.common';
import { ConfigService } from 'src/shared/config/config.service';

export type RequestWithUser = Request & { user: any; payload: any };

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromHeader(request.headers);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.jwt.secret,
      });
      checkTokenExpiry(payload);
      this.validatePayload(payload);
      const user = await this.verifyUser(payload);

      request['user'] = user;
      return true;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        this.logger.error(`Token expired: ${error.message}`);
        throw new UnauthorizedException('Token has expired');
      } else {
        this.logger.error(`JWT Verification failed: ${error.message}`);
        throw new UnauthorizedException('Invalid token');
      }
    }
  }

  public validatePayload(payload: any) {
    if (!payload.address) {
      throw new UnauthorizedException('Invalid token payload');
    }
  }

  public async verifyUser(payload: any) {
    const user = await this.prisma.user.findFirst({
      where: {
        address: payload.address,
      },
    });
    if (!user) {
      this.logger.warn(`User not found: ${payload.sub}`);
      throw new UnauthorizedException('User not found or invalid');
    }
    return user;
  }
}
