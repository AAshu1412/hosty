const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require('../generated/prisma');

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV === 'development') {
    global.prisma = prisma;
}

module.exports = prisma;