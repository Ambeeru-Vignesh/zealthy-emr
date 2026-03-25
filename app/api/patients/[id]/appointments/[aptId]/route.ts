import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; aptId: string }> }
) {
  const { aptId } = await params;
  const body = await req.json();
  const { provider, datetime, repeat, endDate } = body;

  const appointment = await prisma.appointment.update({
    where: { id: parseInt(aptId) },
    data: {
      ...(provider && { provider }),
      ...(datetime && { datetime: new Date(datetime) }),
      ...(repeat !== undefined && { repeat }),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json(appointment);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; aptId: string }> }
) {
  const { aptId } = await params;

  await prisma.appointment.delete({ where: { id: parseInt(aptId) } });
  return NextResponse.json({ success: true });
}
