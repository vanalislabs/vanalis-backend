import { Module } from "@nestjs/common";
import { AuthController } from "./controller/auth.controller";
import { AuthService } from "./service/auth.service";
import { AuthTokenService } from "./service/auth-token.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthTokenService],
})
export class AuthModule { }