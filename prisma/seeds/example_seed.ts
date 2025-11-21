import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
} from '../generated/client';

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

export async function run() {
  // Here is the seed code

  // Cleanup prisma client
  await prisma.$disconnect();
}
