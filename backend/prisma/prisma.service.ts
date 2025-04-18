// prisma.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

async function connectWithRetry(attempt = 1): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');
  } catch (err) {
    console.error(`❌ Prisma connection failed (attempt ${attempt}):`, err.message);

    if (attempt >= MAX_RETRIES) {
      console.error('💀 Max retries reached. Exiting.');
      process.exit(1); // или бросай ошибку, если не хочешь падать
    }

    console.log(`🔁 Retrying in ${RETRY_DELAY_MS / 1000}s...`);
    await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
    return connectWithRetry(attempt + 1);
  }
}

connectWithRetry(); // подключаемся с ретраями

export default prisma;
