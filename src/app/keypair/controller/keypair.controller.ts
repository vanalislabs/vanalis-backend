import { Controller, Get, HttpCode, HttpStatus, UseGuards, UseInterceptors } from "@nestjs/common";
import { KeypairService } from "../service/keypair.service";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TransformInterceptor } from "src/interceptors/transform/transform.interceptor";
import { ResponseMessage } from "src/decorators/response/response-message.decorator";
import { AuthGuard } from "src/guards/auth.guard";
import { GetUser } from "src/decorators/get-user/get-user.decorator";
import { User } from "prisma/generated/client";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Keypair')
@UseInterceptors(TransformInterceptor)
@Controller('keypair')
export class KeypairController {
  constructor(
    private readonly keypairService: KeypairService,
  ) { }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully generated keypair!",
  })
  @ResponseMessage("Successfully generated keypair!")
  @Get('generate')
  async generateKeypair(@GetUser() user: User) {
    return this.keypairService.generateKeypair(user);
  }
}