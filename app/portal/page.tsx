"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { format, addDays, isAfter, isBefore, parseISO } from "date-fns";
import { getAppointmentOccurrences, getPrescriptionRefills } from "@/lib/recurrence";

interface Appointment {
  id: number;
  provider: string;
  datetime: string;
  repeat: string;
  endDate: string | null;
}

interface Prescription {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: string;
  refillSchedule: string;
}

interface PatientData {
  id: number;
  name: string;
  email: string;
  appointments: Appointment[];
  prescriptions: Prescription[];
}

export default function PortalDashboard() {
  const { data: session } = useSession();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      const userId = (session.user as { id?: string }).id;
      fetch(`/api/patients/${userId}`)
        .then((r) => r.json())
        .then((data) => {
          setPatient(data);
          setLoading(false);
        });
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-teal-600">Loading your dashboard...</div>
      </div>
    );
  }

  if (!patient) return null;

  const now = new Date();
  const in7Days = addDays(now, 7);
  const in3Months = addDays(now, 90);

  const upcomingAppointments = getAppointmentOccurrences(
    patient.appointments,
    now,
    in7Days
  );

  const upcomingRefills = getPrescriptionRefills(
    patient.prescriptions,
    now,
    in7Days
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {patient.name.split(" ")[0]}
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s your health summary for the next 7 days
        </p>
      </div>

      {/* Patient Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Patient Information
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Full Name</span>
            <p className="font-medium text-slate-800 mt-0.5">{patient.name}</p>
          </div>
          <div>
            <span className="text-slate-500">Email</span>
            <p className="font-medium text-slate-800 mt-0.5">{patient.email}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upcoming Appointments
            </h2>
            <Link href="/portal/appointments" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              View all →
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm">No appointments in the next 7 days</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-teal-700 leading-none">
                      {format(apt.datetime, "dd")}
                    </span>
                    <span className="text-xs text-teal-600 leading-none">
                      {format(apt.datetime, "MMM")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{apt.provider}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {format(apt.datetime, "EEEE, h:mm a")}
                    </p>
                    {apt.repeat !== "none" && (
                      <span className="badge bg-teal-100 text-teal-700 mt-1">
                        {apt.repeat}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Refills */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Medication Refills
            </h2>
            <Link href="/portal/prescriptions" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              View all →
            </Link>
          </div>

          {upcomingRefills.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm">No refills due in the next 7 days</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingRefills.map((rx, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-blue-700 leading-none">
                      {format(rx.refillOn, "dd")}
                    </span>
                    <span className="text-xs text-blue-600 leading-none">
                      {format(rx.refillOn, "MMM")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{rx.medication}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {rx.dosage} · Qty: {rx.quantity}
                    </p>
                    <span className="badge bg-blue-100 text-blue-700 mt-1">
                      {rx.refillSchedule}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
