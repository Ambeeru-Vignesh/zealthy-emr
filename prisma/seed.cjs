const { PrismaClient } = require(".prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.prescription.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.user.deleteMany();

  const users = [
    {
      id: 1,
      name: "Mark Johnson",
      email: "mark@some-email-provider.net",
      password: "Password123!",
      appointments: [
        {
          id: 1,
          provider: "Dr Kim West",
          datetime: "2026-02-16T16:30:00.000-07:00",
          repeat: "weekly",
        },
        {
          id: 2,
          provider: "Dr Lin James",
          datetime: "2026-02-19T18:30:00.000-07:00",
          repeat: "monthly",
        },
      ],
      prescriptions: [
        {
          id: 1,
          medication: "Lexapro",
          dosage: "5mg",
          quantity: 2,
          refill_on: "2026-02-05",
          refill_schedule: "monthly",
        },
        {
          id: 2,
          medication: "Ozempic",
          dosage: "1mg",
          quantity: 1,
          refill_on: "2026-02-10",
          refill_schedule: "monthly",
        },
      ],
    },
    {
      id: 2,
      name: "Lisa Smith",
      email: "lisa@some-email-provider.net",
      password: "Password123!",
      appointments: [
        {
          id: 3,
          provider: "Dr Sally Field",
          datetime: "2026-02-22T18:15:00.000-07:00",
          repeat: "monthly",
        },
        {
          id: 4,
          provider: "Dr Lin James",
          datetime: "2026-02-25T20:00:00.000-07:00",
          repeat: "weekly",
        },
      ],
      prescriptions: [
        {
          id: 3,
          medication: "Metformin",
          dosage: "500mg",
          quantity: 2,
          refill_on: "2026-02-15",
          refill_schedule: "monthly",
        },
        {
          id: 4,
          medication: "Diovan",
          dosage: "100mg",
          quantity: 1,
          refill_on: "2026-02-25",
          refill_schedule: "monthly",
        },
      ],
    },
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await prisma.user.create({
      data: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        appointments: {
          create: userData.appointments.map((apt) => ({
            id: apt.id,
            provider: apt.provider,
            datetime: new Date(apt.datetime),
            repeat: apt.repeat,
          })),
        },
        prescriptions: {
          create: userData.prescriptions.map((rx) => ({
            id: rx.id,
            medication: rx.medication,
            dosage: rx.dosage,
            quantity: rx.quantity,
            refillOn: new Date(rx.refill_on),
            refillSchedule: rx.refill_schedule,
          })),
        },
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
