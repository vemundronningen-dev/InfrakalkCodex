import { PrismaClient, ResourceCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { id: "seed-company" },
    update: {},
    create: { id: "seed-company", name: "InfraKalk AS", orgNumber: "999999999" }
  });

  const team = await prisma.team.upsert({
    where: { id: "seed-team" },
    update: {},
    create: { id: "seed-team", name: "Estimating", companyId: company.id }
  });

  const user = await prisma.user.upsert({
    where: { id: "seed-user" },
    update: {},
    create: { id: "seed-user", email: "demo@infrakalk.no", name: "Demo User", companyId: company.id }
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project" },
    update: {},
    create: {
      id: "seed-project",
      name: "E6 Utbedring",
      description: "Seed prosjekt",
      teamId: team.id,
      companyId: company.id,
      createdById: user.id
    }
  });

  const chapter = await prisma.chapter.upsert({
    where: { id: "seed-chapter" },
    update: {},
    create: { id: "seed-chapter", projectId: project.id, code: "1", title: "Rigg og drift", level: 1, sortOrder: 1 }
  });

  await prisma.priceItem.upsert({
    where: { id: "seed-item" },
    update: {},
    create: {
      id: "seed-item",
      projectId: project.id,
      chapterId: chapter.id,
      postNumber: "1.10",
      heading: "Etablering riggområde",
      nsCode: "A",
      nsRevision: "2022",
      quantity: 1,
      unit: "RS"
    }
  });

  const templates = [
    { name: "Fagarbeider", category: ResourceCategory.TIMER, defaultUnit: "time", defaultCost: 780 },
    { name: "Maskin", category: ResourceCategory.MASKINER, defaultUnit: "time", defaultCost: 1200 },
    { name: "Materialer", category: ResourceCategory.MATERIALER, defaultUnit: "stk", defaultCost: 450 }
  ];

  for (const t of templates) {
    await prisma.resourceTemplate.upsert({
      where: { id: `tpl-${t.name}` },
      update: {},
      create: { id: `tpl-${t.name}`, ...t }
    });
  }
}

main().finally(() => prisma.$disconnect());
