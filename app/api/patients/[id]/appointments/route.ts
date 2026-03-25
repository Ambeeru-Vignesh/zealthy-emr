import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const appointments = await prisma.appointment.findMany({
    where: { userId: parseInt(id) },
    orderBy: { datetime: "asc" },
  });
  return NextResponse.json(appointments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { provider, datetime, repeat, endDate } = body;

  if (!provider || !datetime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      userId: parseInt(id),
      provider,
      datetime: new Date(datetime),
      repeat: repeat || "none",
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}
