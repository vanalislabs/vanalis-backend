import { SuiEvent } from "@mysten/sui/client";
import { Injectable } from "@nestjs/common";
import { Prisma } from "prisma/generated/client";
import { InputJsonValue } from "prisma/generated/internal/prismaNamespace";
import { NETWORK } from "src/constants/network.constants";
import { PrismaService } from "src/shared/prisma/prisma.service";

@Injectable()
export class IndexerRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async saveEventLog(event: SuiEvent) {
    if (event?.id) {
      const data: any = {
        packageId: event.packageId,
        transactionModule: event.transactionModule,
        sender: event.sender,
        type: event.type,
        parsedJson: event.parsedJson as InputJsonValue,
        bcsEncoding: event.bcsEncoding,
        bcs: event.bcs,
        timestampMs: Number(event.timestampMs),
        rawData: event as unknown as InputJsonValue,
      }

      await this.prisma.eventLog.upsert({
        where: {
          id_network: {
            id: `${event.id.txDigest}:${event.id.eventSeq}`,
            network: NETWORK?.env || '',
          },
        },
        update: data,
        create: {
          ...data,
          id: `${event.id.txDigest}:${event.id.eventSeq}`,
          network: NETWORK?.env || '',
        },
      });
    }
  }
}