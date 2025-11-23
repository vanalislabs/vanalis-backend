import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/prisma/prisma.service";
import sodium from "libsodium-wrappers";
import { User } from "prisma/generated/client";
import { RetrieveKeypairQueryDto } from "../dto/retrieve-keypair-query.dto";

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

  async retrieveKeypair(query: RetrieveKeypairQueryDto, user: User) {
    const bytesPublicKey = Uint8Array.from(Buffer.from(query.publicKey, 'hex'));

    let keypair = await this.prisma.cryptoKeypair.findUnique({
      where: {
        creator_publicKey: {
          creator: user.address,
          publicKey: bytesPublicKey,
        },
      },
    });

    if (!keypair) {
      const haveAccess = await this.prisma.accountAccessCryptoKeypair.findUnique({
        where: {
          address_publicKey: {
            address: user.address,
            publicKey: bytesPublicKey,
          },
        },
      });

      if (haveAccess) {
        keypair = await this.prisma.cryptoKeypair.findFirst({
          where: {
            publicKey: bytesPublicKey,
          },
        });
      }
    }

    if (!keypair) {
      throw new BadRequestException('Keypair not found or you do not have access to it');
    }

    return {
      publicKey: Buffer.from(keypair?.publicKey as Uint8Array).toString('hex'),
      privateKey: Buffer.from(keypair?.privateKey as Uint8Array).toString('hex'),
      keyType: keypair?.keyType,
    };
  }
}