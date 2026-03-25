import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SETUP_TOKEN = process.env.SETUP_TOKEN ?? "zealthy-setup-2026";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-setup-token") ?? req.nextUrl.searchParams.get("token");

  if (token !== SETUP_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create tables if they don't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Appointment" (
        "id" SERIAL NOT NULL,
        "userId" INTEGER NOT NULL,
        "provider" TEXT NOT NULL,
        "datetime" TIMESTAMP(3) NOT NULL,
        "repeat" TEXT NOT NULL DEFAULT 'none',
        "endDate" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") 
          REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Prescription" (
        "id" SERIAL NOT NULL,
        "userId" INTEGER NOT NULL,
        "medication" TEXT NOT NULL,
        "dosage" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "refillOn" TIMESTAMP(3) NOT NULL,
        "refillSchedule" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Prescription_userId_fkey" FOREIGN KEY ("userId") 
          REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Check if already seeded
    const count = await prisma.user.count();
    if (count > 0) {
      return NextResponse.json({ message: "Tables exist and already seeded", count });
    }

    // Seed sample data
    const users = [
      {
        name: "Mark Johnson",
        email: "mark@some-email-provider.net",
        password: "Password123!",
        appointments: [
          { provider: "Dr Kim West", datetime: "2026-02-16T23:30:00.000Z", repeat: "weekly" },
          { provider: "Dr Lin James", datetime: "2026-02-20T01:30:00.000Z", repeat: "monthly" },
        ],
        prescriptions: [
          { medication: "Lexapro", dosage: "5mg", quantity: 2, refillOn: "2026-02-05T00:00:00.000Z", refillSchedule: "monthly" },
          { medication: "Ozempic", dosage: "1mg", quantity: 1, refillOn: "2026-02-10T00:00:00.000Z", refillSchedule: "monthly" },
        ],
      },
      {
        name: "Lisa Smith",
        email: "lisa@some-email-provider.net",
        password: "Password123!",
        appointments: [
          { provider: "Dr Sally Field", datetime: "2026-02-23T01:15:00.000Z", repeat: "monthly" },
          { provider: "Dr Lin James", datetime: "2026-02-26T03:00:00.000Z", repeat: "weekly" },
        ],
        prescriptions: [
          { medication: "Metformin", dosage: "500mg", quantity: 2, refillOn: "2026-02-15T00:00:00.000Z", refillSchedule: "monthly" },
          { medication: "Diovan", dosage: "100mg", quantity: 1, refillOn: "2026-02-25T00:00:00.000Z", refillSchedule: "monthly" },
        ],
      },
    ];

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          appointments: {
            create: userData.appointments.map((apt) => ({
              provider: apt.provider,
              datetime: new Date(apt.datetime),
              repeat: apt.repeat,
            })),
          },
          prescriptions: {
            create: userData.prescriptions.map((rx) => ({
              medication: rx.medication,
              dosage: rx.dosage,
              quantity: rx.quantity,
              refillOn: new Date(rx.refillOn),
              refillSchedule: rx.refillSchedule,
            })),
          },
        },
      });
    }

    return NextResponse.json({
      message: "Database set up and seeded successfully!",
      credentials: [
        { email: "mark@some-email-provider.net", password: "Password123!" },
        { email: "lisa@some-email-provider.net", password: "Password123!" },
      ],
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token !== SETUP_TOKEN) {
    return NextResponse.json({ error: "Add ?token=zealthy-setup-2026 to run setup" }, { status: 401 });
  }
  return POST(req);
}
