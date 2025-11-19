import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/prisma/prisma.service";

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async getOrCreateUserByAddress(address: string) {
    let user = await this.prisma.user.findUnique({
      where: { address },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { address },
      });
    }

    return user;
  }
}