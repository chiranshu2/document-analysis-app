import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient();

async function debug() {
  try {
    const orgs = await prisma.organization.findMany({ take: 5 });
    console.log('Existing organizations:', JSON.stringify(orgs, null, 2));
  } catch (e) {
    console.error('Error querying organizations:', e.message);
    console.error('Full error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
