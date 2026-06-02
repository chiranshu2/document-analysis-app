const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function debug() {
  try {
    const orgs = await prisma.organization.findMany({ take: 5 });
    console.log('Existing organizations:', JSON.stringify(orgs, null, 2));
  } catch (e) {
    console.error('Error querying organizations:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
