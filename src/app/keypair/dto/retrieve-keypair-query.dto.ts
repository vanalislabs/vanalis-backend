import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RetrieveKeypairQueryDto {
  @ApiProperty({
    description: 'The public key of the keypair',
    example: '8af9bc8398751cf219267fa36feef8f54eeed500b8fffe2e8cbad2632ff33950',
  })
  @IsString()
  @IsNotEmpty()
  publicKey: string;
}