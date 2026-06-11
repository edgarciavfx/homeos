import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const user = await prisma.user.upsert({
    where: { email: "edgar@homeos.dev" },
    update: {},
    create: {
      email: "edgar@homeos.dev",
      name: "Edgar",
    },
  });

  const household = await prisma.household.upsert({
    where: { id: "demo-household" },
    update: {},
    create: {
      id: "demo-household",
      name: "Edgar & Marifer",
      ownerId: user.id,
    },
  });

  await prisma.householdMember.upsert({
    where: { householdId_userId: { householdId: household.id, userId: user.id } },
    update: {},
    create: {
      householdId: household.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  const meals = [
    { name: "Chicken Tacos", minutes: 30 },
    { name: "Pasta Bolognese", minutes: 45 },
    { name: "Grilled Salmon", minutes: 25 },
    { name: "Vegetable Stir Fry", minutes: 20 },
    { name: "Chicken Curry", minutes: 40 },
  ];

  for (const m of meals) {
    const meal = await prisma.meal.create({
      data: {
        householdId: household.id,
        name: m.name,
        preparationMinutes: m.minutes,
      },
    });

    await prisma.mealIngredient.createMany({
      data: [
        { mealId: meal.id, name: `${m.name} Base`, quantity: 1, unit: "serving" },
      ],
    });
  }

  const frequencies = ["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"] as const;
  const choreNames = [
    "Bathroom Cleaning",
    "Kitchen Cleaning",
    "Vacuum Floors",
    "Take Out Trash",
    "Laundry",
    "Dust Living Room",
    "Mop Kitchen Floor",
    "Clean Windows",
  ];

  for (const name of choreNames) {
    await prisma.chore.create({
      data: {
        householdId: household.id,
        name,
        frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
      },
    });
  }

  await prisma.budget.create({
    data: {
      householdId: household.id,
      month: 6,
      year: 2026,
      amount: 12000,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
