import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const TABLES_PER_HALL = 60;

const halls = [
  { name: "Sala Noblesse", slug: "sala-noblesse", shortLabel: "SN" },
  { name: "Paradis Grandoria", slug: "paradis-grandoria", shortLabel: "PG" },
  { name: "Restaurant Paradis", slug: "restaurant-paradis", shortLabel: "RP" },
  { name: "Sala Ephemeria", slug: "sala-ephemeria", shortLabel: "SE" },
  { name: "Foisor 1 Noblesse", slug: "foisor-1-noblesse", shortLabel: "F1" },
  { name: "Foisor 2 Raureni", slug: "foisor-2-raureni", shortLabel: "F2" },
];

async function main() {
  for (const [index, hall] of halls.entries()) {
    const createdHall = await prisma.hall.upsert({
      where: { slug: hall.slug },
      update: {
        name: hall.name,
        shortLabel: hall.shortLabel,
        sortOrder: index,
      },
      create: {
        name: hall.name,
        slug: hall.slug,
        shortLabel: hall.shortLabel,
        sortOrder: index,
      },
    });

    for (let number = 1; number <= TABLES_PER_HALL; number += 1) {
      await prisma.table.upsert({
        where: { hallId_number: { hallId: createdHall.id, number } },
        update: {},
        create: {
          hallId: createdHall.id,
          number,
          name: `Masa ${number}`,
          status: "NEW",
        },
      });
    }

    console.log(
      `Seeded hall "${hall.name}" with ${TABLES_PER_HALL} tables.`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
