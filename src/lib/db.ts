import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
const connectionString = process.env.DATABASE_URL;

const prismaClientSingleton = () => {
    // 1. Create a logical connection pool
    const pool = new Pool({ connectionString });
    // 2. Create the driver adapter
    const adapter = new PrismaPg(pool);
    // 3. Pass adapter to Prisma Client
    return new PrismaClient({ adapter });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
