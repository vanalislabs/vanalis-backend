import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/prisma/prisma.service";
import sodium from "libsodium-wrappers";
import { User } from "prisma/generated/client";

@Injectable()
export class KeypairService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async generateKeypair(user: User) {
    const keypair = sodium.crypto_box_keypair();

    await this.prisma.cryptoKeypair.create({
      data: {
        creator: user.address,
        publicKey: keypair.publicKey,
        privateKey: keypair.privateKey,
        keyType: keypair.keyType,
      },
    });

    return {
      publicKey: Buffer.from(keypair?.publicKey as Uint8Array).toString('hex'),
      privateKey: Buffer.from(keypair?.privateKey as Uint8Array).toString('hex'),
      keyType: keypair?.keyType,
    };
  }
}