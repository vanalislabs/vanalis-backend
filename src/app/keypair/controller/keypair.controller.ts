import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { KeypairService } from "../service/keypair.service";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TransformInterceptor } from "src/interceptors/transform/transform.interceptor";
import { ResponseMessage } from "src/decorators/response/response-message.decorator";
import { AuthGuard } from "src/guards/auth.guard";
import { GetUser } from "src/decorators/get-user/get-user.decorator";
import { User } from "prisma/generated/client";
import { RetrieveKeypairQueryDto } from "../dto/retrieve-keypair-query.dto";

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

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved keypair!",
  })
  @ResponseMessage("Successfully retrieved keypair!")
  @Get('retrieve')
  async retrieveKeypair(
    @Query() query: RetrieveKeypairQueryDto,
    @GetUser() user: User
  ) {
    return this.keypairService.retrieveKeypair(query, user);
  }
}