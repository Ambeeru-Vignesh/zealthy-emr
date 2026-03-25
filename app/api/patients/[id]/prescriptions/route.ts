import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prescriptions = await prisma.prescription.findMany({
    where: { userId: parseInt(id) },
    orderBy: { refillOn: "asc" },
  });
  return NextResponse.json(prescriptions);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { medication, dosage, quantity, refillOn, refillSchedule } = body;

  if (!medication || !dosage || !quantity || !refillOn || !refillSchedule) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const prescription = await prisma.prescription.create({
    data: {
      userId: parseInt(id),
      medication,
      dosage,
      quantity: parseInt(quantity),
      refillOn: new Date(refillOn),
      refillSchedule,
    },
  });

  return NextResponse.json(prescription, { status: 201 });
}
