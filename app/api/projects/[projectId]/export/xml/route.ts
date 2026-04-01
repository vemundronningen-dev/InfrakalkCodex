import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { projectId: string } }) {
  const pricedItems = await prisma.priceItem.findMany({
    where: { projectId: params.projectId, isPriced: true },
    orderBy: { postNumber: "asc" }
  });

  const posts = pricedItems
    .map(
      (item) => `<Post><Postnr>${item.postNumber}</Postnr><Kodetekst>${item.heading}</Kodetekst><Prisinfo><Enhetspris>${item.salesPrice}</Enhetspris></Prisinfo></Post>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><ProsjektNS><Poster>${posts}</Poster></ProsjektNS>`;
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Content-Disposition": `attachment; filename="priced-items-${params.projectId}.xml"`
    }
  });
}
