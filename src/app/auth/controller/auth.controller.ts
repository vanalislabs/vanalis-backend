import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TransformInterceptor } from "src/interceptors/transform/transform.interceptor";
import { AuthService } from "../service/auth.service";
import { ResponseMessage } from "src/decorators/response/response-message.decorator";
import { LoginBodyDto } from "../dto/login-body.dto";
import { RefreshTokenBodyDto } from "../dto/refresh-token-body.dto";
import { AuthTokenService } from "../service/auth-token.service";
import { AuthGuard } from "src/guards/auth.guard";
import { GetUser } from "src/decorators/get-user/get-user.decorator";
import { type User } from "@prisma/client";
import { AUTH_LOGIN_TEXT_TO_SIGN } from "src/constants/auth.constants";

@ApiTags('Auth')
@UseInterceptors(TransformInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authTokenService: AuthTokenService,
  ) { }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully logged in!"
  })
  @ResponseMessage("Successfully logged in!")
  @Get("text-to-sign")
  async textToSign() {
    return AUTH_LOGIN_TEXT_TO_SIGN;
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully logged in!"
  })
  @ResponseMessage("Successfully logged in!")
  @Post("login")
  async login(@Body() body: LoginBodyDto) {
    return this.authService.login(body);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Refresh token successfully',
  })
  @ResponseMessage('Refresh token successfully')
  async refreshToken(@Body() body: RefreshTokenBodyDto) {
    const refreshToken = body.refreshToken;

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authTokenService.refreshUserAccessToken(refreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Successfully get authenticated user data!',
  })
  @ResponseMessage('Successfully get authenticated user data!')
  @Get('me')
  async me(@GetUser() user: User) {
    return user;
  }
}