import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; rxId: string }> }
) {
  const { rxId } = await params;
  const body = await req.json();
  const { medication, dosage, quantity, refillOn, refillSchedule } = body;

  const prescription = await prisma.prescription.update({
    where: { id: parseInt(rxId) },
    data: {
      ...(medication && { medication }),
      ...(dosage && { dosage }),
      ...(quantity !== undefined && { quantity: parseInt(quantity) }),
      ...(refillOn && { refillOn: new Date(refillOn) }),
      ...(refillSchedule && { refillSchedule }),
    },
  });

  return NextResponse.json(prescription);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; rxId: string }> }
) {
  const { rxId } = await params;

  await prisma.prescription.delete({ where: { id: parseInt(rxId) } });
  return NextResponse.json({ success: true });
}
