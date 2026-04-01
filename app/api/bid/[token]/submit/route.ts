import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  entries: z.array(
    z.object({
      bidPackageItemId: z.string(),
      unitPrice: z.number(),
      totalPrice: z.number(),
      comment: z.string().optional(),
      attachmentUrl: z.string().optional(),
      status: z.enum(["draft", "submitted"]).default("draft")
    })
  )
});

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const invitation = await prisma.externalInvitation.findUnique({ where: { token: params.token } });
  if (!invitation) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  const body = schema.parse(await req.json());

  await prisma.$transaction(
    body.entries.map((entry) =>
      prisma.bidSubmission.upsert({
        where: { id: `${params.token}-${entry.bidPackageItemId}` },
        create: {
          id: `${params.token}-${entry.bidPackageItemId}`,
          bidPackageItemId: entry.bidPackageItemId,
          unitPrice: entry.unitPrice,
          totalPrice: entry.totalPrice,
          comment: entry.comment,
          attachmentUrl: entry.attachmentUrl,
          submittedAt: entry.status === "submitted" ? new Date() : null,
          status: entry.status
        },
        update: {
          unitPrice: entry.unitPrice,
          totalPrice: entry.totalPrice,
          comment: entry.comment,
          attachmentUrl: entry.attachmentUrl,
          submittedAt: entry.status === "submitted" ? new Date() : null,
          status: entry.status
        }
      })
    )
  );

  if (body.entries.some((e) => e.status === "submitted")) {
    await prisma.externalInvitation.update({ where: { id: invitation.id }, data: { status: "SUBMITTED" } });
  }

  return NextResponse.json({ ok: true });
}
