import { Module } from "@nestjs/common";
import { KeypairController } from "./controller/keypair.controller";
import { KeypairService } from "./service/keypair.service";

@Module({
  controllers: [KeypairController],
  providers: [KeypairService],
})
export class KeypairModule { }