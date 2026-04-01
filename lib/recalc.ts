import { prisma } from "@/lib/prisma";

export async function recalculatePriceItem(priceItemId: string) {
  const [resources, purchases] = await Promise.all([
    prisma.resourceLine.findMany({ where: { priceItemId } }),
    prisma.purchaseLine.findMany({ where: { priceItemId } })
  ]);

  const total = [...resources, ...purchases].reduce((sum, row) => sum + Number(row.totalCost), 0);
  await prisma.priceItem.update({ where: { id: priceItemId }, data: { costTotal: total } });
}
