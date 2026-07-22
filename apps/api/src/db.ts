let prismaInstance: any = null;

try {
  const { PrismaClient } = require('@prisma/client');
  prismaInstance = new PrismaClient({
    log: ['error'],
  });
} catch (err) {
  console.warn('PrismaClient require/init warning on Vercel:', err);
}

// Fail-Safe Proxy preventing module load crashes or runtime exceptions on Vercel
export const db: any = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prismaInstance && typeof prismaInstance[prop] !== 'undefined') {
        const val = prismaInstance[prop];
        if (typeof val === 'function') {
          return (...args: any[]) => {
            try {
              return val.apply(prismaInstance, args);
            } catch (e) {
              console.warn(`Prisma method ${String(prop)} failed:`, e);
              return Promise.resolve(null);
            }
          };
        }
        return val;
      }
      return () => Promise.resolve(null);
    },
  }
);
