import { prisma } from "@/lib/prisma";
import { parseNs3459 } from "@/lib/xml-import";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

  const xmlText = await file.text();
  const data = parseNs3459(xmlText);

  await prisma.$transaction(async (tx) => {
    await tx.chapter.deleteMany({ where: { projectId: params.projectId } });
    await tx.priceItem.deleteMany({ where: { projectId: params.projectId } });

    const chapterMap = new Map<string, string>();

    for (const chapter of data.chapters) {
      const parentCode = chapter.code.includes(".") ? chapter.code.split(".").slice(0, -1).join(".") : null;
      const parentId = parentCode ? chapterMap.get(parentCode) : undefined;
      const created = await tx.chapter.create({
        data: {
          projectId: params.projectId,
          code: chapter.code,
          title: chapter.title,
          level: chapter.level,
          sortOrder: chapter.sortOrder,
          parentId
        }
      });
      chapterMap.set(chapter.code, created.id);
    }

    for (const item of data.items) {
      const chapterCode = item.postNumber.includes(".") ? item.postNumber.split(".").slice(0, -1).join(".") : item.postNumber;
      const chapterId = chapterMap.get(chapterCode);
      await tx.priceItem.create({
        data: {
          projectId: params.projectId,
          chapterId,
          postNumber: item.postNumber,
          nsCode: item.nsCode,
          nsRevision: item.nsRevision,
          heading: item.heading,
          quantity: item.quantity,
          unit: item.unit,
          quantityRule: item.quantityRule,
          description: {
            create: {
              nsCode: item.description.nsCode,
              nsRevision: item.description.nsRevision,
              heading: item.description.heading,
              rawXml: item.description.rawXml,
              displayText: item.description.displayText,
              keywords: { create: item.description.keywords },
              matrixValues: { create: item.description.matrixValues },
              requirements: { create: item.description.requirements }
            }
          }
        }
      });
    }
  });

  return NextResponse.json({ ok: true, importedItems: data.items.length });
}
