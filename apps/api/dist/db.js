"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@prisma/client");
let prismaInstance = null;
try {
    prismaInstance = new client_1.PrismaClient({
        log: ['error'],
    });
}
catch (err) {
    console.warn('PrismaClient top-level initialization warning:', err);
}
// Proxy to prevent module load crash if PrismaClient initialization throws on Vercel
exports.db = new Proxy({}, {
    get(_target, prop) {
        if (prismaInstance && prismaInstance[prop]) {
            return prismaInstance[prop];
        }
        // Fail-safe mock methods if PrismaClient is unavailable
        return () => Promise.resolve(null);
    },
});
