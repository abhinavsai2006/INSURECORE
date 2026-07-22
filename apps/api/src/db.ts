import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

try {
  prismaInstance = new PrismaClient({
    log: ['error'],
  });
} catch (err) {
  console.warn('PrismaClient top-level initialization warning:', err);
}

// Proxy to prevent module load crash if PrismaClient initialization throws on Vercel
export const db: any = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prismaInstance && (prismaInstance as any)[prop]) {
        return (prismaInstance as any)[prop];
      }
      // Fail-safe mock methods if PrismaClient is unavailable
      return () => Promise.resolve(null);
    },
  }
);
