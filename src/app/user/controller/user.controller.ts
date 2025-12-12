import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TransformInterceptor } from "src/interceptors/transform/transform.interceptor";
import { Controller, Get, HttpCode, HttpStatus, Param, UseInterceptors } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { ResponseMessage } from "src/decorators/response/response-message.decorator";

@ApiTags('User')
@UseInterceptors(TransformInterceptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved user!",
  })
  @ResponseMessage("Successfully retrieved user!")
  @Get(':address')
  async getUserDetail(@Param('address') address: string) {
    return this.userService.getUserDetail(address);
  }
}