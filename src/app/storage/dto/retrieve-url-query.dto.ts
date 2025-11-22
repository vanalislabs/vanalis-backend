import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RetrieveUrlQueryDto {
  @ApiProperty({
    description: 'The file path key',
    example: 'full-dataset/1234567890.csv',
  })
  @IsString()
  @IsNotEmpty()
  filePathKey: string;
}