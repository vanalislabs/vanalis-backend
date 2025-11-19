import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

const softDeleteExtension = createSoftDeleteExtension({
  models: {
    User: true,
  },
  defaultConfig: {
    field: 'deletedAt',
    createValue: (deleted) => {
      if (deleted) return new Date();
      return null;
    },
    allowToOneUpdates: true,
    allowCompoundUniqueIndexWhere: true,
  },
});

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  softDeleteExtension = softDeleteExtension;

  constructor() {
    super();
    Object.assign(this, this.$extends(this.softDeleteExtension));
  }

  async onModuleInit() {
    await this.$connect();
  }
}