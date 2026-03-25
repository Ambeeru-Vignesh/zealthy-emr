import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SETUP_TOKEN = process.env.SETUP_TOKEN;

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-setup-token");

  if (!SETUP_TOKEN || token !== SETUP_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if already seeded
    const count = await prisma.user.count();
    if (count > 0) {
      return NextResponse.json({ message: "Already seeded", count });
    }

    const users = [
      {
        name: "Mark Johnson",
        email: "mark@some-email-provider.net",
        password: "Password123!",
        appointments: [
          { provider: "Dr Kim West", datetime: "2026-02-16T16:30:00.000Z", repeat: "weekly" },
          { provider: "Dr Lin James", datetime: "2026-02-19T18:30:00.000Z", repeat: "monthly" },
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
          { provider: "Dr Sally Field", datetime: "2026-02-22T18:15:00.000Z", repeat: "monthly" },
          { provider: "Dr Lin James", datetime: "2026-02-25T20:00:00.000Z", repeat: "weekly" },
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

    return NextResponse.json({ message: "Database seeded successfully!", users: 2 });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
