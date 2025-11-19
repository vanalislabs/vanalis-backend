import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  jwtSignature: string;
}