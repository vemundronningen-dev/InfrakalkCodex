import { recalculatePriceItem } from "@/lib/recalc";
import { prisma } from "@/lib/prisma";
import { resourceTotal } from "@/lib/calculations";
import { ResourceCategory } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  priceItemId: z.string(),
  name: z.string(),
  category: z.nativeEnum(ResourceCategory),
  unit: z.string(),
  quantity: z.number(),
  unitCost: z.number()
});

export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  const totalCost = resourceTotal(body.quantity, body.unitCost);

  const line = await prisma.resourceLine.create({
    data: { ...body, totalCost }
  });

  await recalculatePriceItem(body.priceItemId);
  return NextResponse.json(line);
}
