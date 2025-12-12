import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async getUserDetail(address: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        address,
      },
    });

    return user;
  }
}