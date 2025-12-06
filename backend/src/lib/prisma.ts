import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Configuração do Prisma Client com adapter para Prisma 7
const prismaClientSingleton = () => {
  // Configurar Pool com credenciais explícitas para evitar problemas com SCRAM
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'chat_db',
    user: 'user',
    password: 'password',
    ssl: false
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;