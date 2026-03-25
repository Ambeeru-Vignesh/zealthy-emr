import {
  addWeeks,
  addMonths,
  addDays,
  isBefore,
  isAfter,
  parseISO,
} from "date-fns";

export interface AppointmentOccurrence {
  id: number;
  provider: string;
  datetime: Date;
  repeat: string;
  endDate: Date | null;
  isRecurring: boolean;
  originalId: number;
}

export interface PrescriptionRefill {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: Date;
  refillSchedule: string;
  isRecurring: boolean;
  originalId: number;
}

export function getAppointmentOccurrences(
  appointments: {
    id: number;
    provider: string;
    datetime: Date | string;
    repeat: string;
    endDate: Date | string | null;
  }[],
  fromDate: Date,
  toDate: Date
): AppointmentOccurrence[] {
  const results: AppointmentOccurrence[] = [];

  for (const apt of appointments) {
    const start = new Date(apt.datetime);
    const end = apt.endDate ? new Date(apt.endDate) : null;

    let current = start;

    while (isBefore(current, toDate) || current.getTime() === toDate.getTime()) {
      if (end && isAfter(current, end)) break;

      if (!isBefore(current, fromDate)) {
        results.push({
          id: apt.id,
          provider: apt.provider,
          datetime: new Date(current),
          repeat: apt.repeat,
          endDate: end,
          isRecurring: current.getTime() !== start.getTime(),
          originalId: apt.id,
        });
      }

      if (apt.repeat === "weekly") {
        current = addWeeks(current, 1);
      } else if (apt.repeat === "monthly") {
        current = addMonths(current, 1);
      } else if (apt.repeat === "daily") {
        current = addDays(current, 1);
      } else {
        break;
      }
    }
  }

  return results.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
}

export function getPrescriptionRefills(
  prescriptions: {
    id: number;
    medication: string;
    dosage: string;
    quantity: number;
    refillOn: Date | string;
    refillSchedule: string;
  }[],
  fromDate: Date,
  toDate: Date
): PrescriptionRefill[] {
  const results: PrescriptionRefill[] = [];

  for (const rx of prescriptions) {
    // Parse as UTC date-only (avoid timezone shift)
    const d = new Date(rx.refillOn);
    const start = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    let current = start;

    while (isBefore(current, toDate) || current.getTime() === toDate.getTime()) {
      if (!isBefore(current, fromDate)) {
        results.push({
          id: rx.id,
          medication: rx.medication,
          dosage: rx.dosage,
          quantity: rx.quantity,
          refillOn: new Date(current),
          refillSchedule: rx.refillSchedule,
          isRecurring: current.getTime() !== start.getTime(),
          originalId: rx.id,
        });
      }

      if (rx.refillSchedule === "weekly") {
        current = addWeeks(current, 1);
      } else if (rx.refillSchedule === "monthly") {
        current = addMonths(current, 1);
      } else if (rx.refillSchedule === "daily") {
        current = addDays(current, 1);
      } else {
        break;
      }
    }
  }

  return results.sort((a, b) => a.refillOn.getTime() - b.refillOn.getTime());
}
