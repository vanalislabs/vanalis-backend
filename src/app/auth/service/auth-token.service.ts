import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "../../../../prisma/generated/client";
import { JWTPayload } from "jose";
import { ConfigService } from "src/shared/config/config.service";
import { PrismaService } from "src/shared/prisma/prisma.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) { }

  generateUserAccessToken(user: User) {
    const payload: JWTPayload = {
      address: user.address,
      iat: new Date().getTime() / 1000,
    };
    return this.jwtService.sign(payload as any, {
      expiresIn: this.config.jwt.expiresIn as any,
      secret: this.config.jwt.secret,
    });
  }

  async generateUserRefreshToken(user: User) {
    const token = uuidv4();
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 7);

    await this.prisma.userRefreshToken.create({
      data: {
        token,
        userAddress: user.address,
        expiredAt,
      },
    });

    return token;
  }

  async refreshUserAccessToken(refreshToken: string) {
    const storedToken = await this.prisma.userRefreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiredAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.userRefreshToken.update({
      where: { id: storedToken.id },
      data: {
        expiredAt: new Date(),
      },
    });
    const accessToken = await this.generateUserAccessToken(storedToken.user);

    const newRefreshToken = await this.generateUserRefreshToken(
      storedToken.user,
    );

    return { accessToken, refreshToken: newRefreshToken };
  }
}