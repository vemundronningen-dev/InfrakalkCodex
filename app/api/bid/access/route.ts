import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const invitation = await prisma.externalInvitation.findUnique({ where: { token } });
  if (!invitation) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  const packages = await prisma.bidPackage.findMany({
    where: { projectId: invitation.projectId, externalCompanyId: invitation.externalCompanyId },
    include: {
      items: {
        include: {
          priceItem: { select: { id: true, postNumber: true, heading: true, quantity: true, unit: true } },
          submissions: true
        }
      }
    }
  });

  return NextResponse.json({ invitation, packages });
}
