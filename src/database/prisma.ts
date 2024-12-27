import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient({ datasourceUrl: "mysql://jateez:jateez@localhost:3306/locallead_db" });

export default prisma;
