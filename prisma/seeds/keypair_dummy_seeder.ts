import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
} from '../generated/client';

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

export async function run() {
  // Here is the seed code
  prisma.cryptoKeypair.create({
    data: {
      creator: '0xf5b0fffe7cf77b8c222dfa3e89b4e2ef03b3203e74453163d7d8d1111110df5b',
      publicKey: Uint8Array.from(Buffer.from('8af9bc8398751cf219267fa36feef8f54eeed500b8fffe2e8cbad2632ff33950', 'hex')),
      privateKey: Uint8Array.from(Buffer.from('448ca58681676437cd7029a6ff9402ebe014fe7dcfa45e520cee42754e02ede2', 'hex')),
      keyType: 'x25519',
    },
  });

  // Cleanup prisma client
  await prisma.$disconnect();
}


