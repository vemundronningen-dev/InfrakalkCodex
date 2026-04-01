import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { projectId: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      priceItems: { where: { isPriced: true }, orderBy: { postNumber: "asc" } }
    }
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lines = project.priceItems
    .map((item) => `${item.postNumber} ${item.heading} ${Number(item.salesPrice).toFixed(2)} NOK`)
    .join("\n");

  const pseudoPdf = `%PDF-1.4\n% InfraKalk\n${project.name}\n${lines}\n%%EOF`;
  return new NextResponse(Buffer.from(pseudoPdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="priced-items-${project.id}.pdf"`
    }
  });
}
