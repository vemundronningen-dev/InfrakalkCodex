import { recalculatePriceItem } from "@/lib/recalc";
import { prisma } from "@/lib/prisma";
import { purchaseNetPrice, purchaseTotal } from "@/lib/calculations";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  priceItemId: z.string(),
  itemNumber: z.string().nullable().optional(),
  description: z.string(),
  supplier: z.string().nullable().optional(),
  quantity: z.number(),
  grossPrice: z.number(),
  discount: z.number()
});

export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  const netPrice = purchaseNetPrice(body.grossPrice, body.discount);
  const totalCost = purchaseTotal(body.quantity, netPrice);

  const line = await prisma.purchaseLine.create({
    data: { ...body, netPrice, totalCost }
  });

  await recalculatePriceItem(body.priceItemId);
  return NextResponse.json(line);
}
