import { PrismaClient } from "@prisma/client";

const SCHEMA_GEN = "nexo-concept-2";
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchema?: string;
};

if (globalForPrisma.prismaSchema !== SCHEMA_GEN) {
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchema = SCHEMA_GEN;
}
