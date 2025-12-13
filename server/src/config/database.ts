import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from './env';


// console.log("DATABASE_URL seen by Prisma:", env.DATABASE_URL);

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl:{
    rejectUnauthorized:false
  }
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});

