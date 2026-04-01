import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  externalCompany: z.object({
    name: z.string(),
    orgNumber: z.string().optional(),
    contactName: z.string().optional(),
    email: z.string().email()
  }),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string(),
  priceItemIds: z.array(z.string()).min(1)
});

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const body = schema.parse(await req.json());
  const token = crypto.randomUUID();

  const externalCompany = await prisma.externalCompany.create({ data: body.externalCompany });
  const invitation = await prisma.externalInvitation.create({
    data: {
      projectId: params.projectId,
      externalCompanyId: externalCompany.id,
      email: body.externalCompany.email,
      token,
      dueDate: new Date(body.dueDate)
    }
  });

  const bidPackage = await prisma.bidPackage.create({
    data: {
      projectId: params.projectId,
      externalCompanyId: externalCompany.id,
      title: body.title,
      description: body.description,
      dueDate: new Date(body.dueDate),
      items: {
        create: body.priceItemIds.map((id) => ({ priceItemId: id }))
      }
    },
    include: { items: true }
  });

  return NextResponse.json({
    invitation,
    bidPackage,
    secureLink: `${process.env.NEXTAUTH_URL}/external/bid/${token}`
  });
}
