import { BadRequestException, Injectable } from "@nestjs/common";
import { LoginBodyDto } from "../dto/login-body.dto";
import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "src/shared/config/config.service";
import { AuthTokenService } from "./auth-token.service";
import { UserRepository } from "src/repositories/user.repository";
import { featureFlag } from "src/commons/feature-flag.common";

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly authTokenService: AuthTokenService,
    private readonly userRepository: UserRepository,
  ) { }

  async login(body: LoginBodyDto) {
    let valid = true;
    let data: any = null;

    const bypassAuth = featureFlag('BYPASS_AUTH');

    if (!bypassAuth) {
      try {
        data = await this.jwtService.verifyAsync(body.jwtSignature, {
          secret: this.config.jwt.secret,
        })
      } catch (error) {
        valid = false;
      }

      if (valid && data?.address && data?.signature) {
        const address = data.address;
        const signature = data.signature;
        const message = new TextEncoder().encode('Sign this message to sign in');
        valid = await this.validateSignature(message, signature, address);
      }

      if (!valid) {
        throw new BadRequestException('Invalid signature');
      }
    } else {
      data = {
        address: process.env.BYPASS_AUTH_ADDRESS,
      };
    }

    const user = await this.userRepository.getOrCreateUserByAddress(data.address);

    const accessToken = this.authTokenService.generateUserAccessToken(user);
    const refreshToken = await this.authTokenService.generateUserRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    }
  }

  async validateSignature(message: Uint8Array<ArrayBuffer>, signature: string, address: string) {
    let valid = true;

    try {
      await verifyPersonalMessageSignature(message, signature, {
        address: address,
      });
    } catch (error) {
      valid = false;
    }

    return valid;
  }
}