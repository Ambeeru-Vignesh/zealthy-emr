"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { format, addDays } from "date-fns";
import { getAppointmentOccurrences } from "@/lib/recurrence";

interface Appointment {
  id: number;
  provider: string;
  datetime: string;
  repeat: string;
  endDate: string | null;
}

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      const userId = (session.user as { id?: string }).id;
      fetch(`/api/patients/${userId}/appointments`)
        .then((r) => r.json())
        .then((data) => {
          setAppointments(data);
          setLoading(false);
        });
    }
  }, [session]);

  if (loading) {
    return <div className="text-center py-20 text-teal-600">Loading appointments...</div>;
  }

  const now = new Date();
  const in3Months = addDays(now, 90);

  const occurrences = getAppointmentOccurrences(appointments, now, in3Months);

  const grouped: Record<string, typeof occurrences> = {};
  for (const occ of occurrences) {
    const key = format(occ.datetime, "MMMM yyyy");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(occ);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upcoming Appointments</h1>
        <p className="text-slate-500 mt-1">Your full schedule for the next 3 months</p>
      </div>

      {occurrences.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-slate-500">No upcoming appointments scheduled</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, appts]) => (
            <div key={month}>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {month}
              </h2>
              <div className="space-y-3">
                {appts.map((apt, i) => (
                  <div key={i} className="card flex items-center gap-4 py-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-teal-50 rounded-xl flex flex-col items-center justify-center border border-teal-100">
                      <span className="text-xl font-bold text-teal-700 leading-none">
                        {format(apt.datetime, "d")}
                      </span>
                      <span className="text-xs text-teal-600 leading-none mt-0.5">
                        {format(apt.datetime, "EEE")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800">{apt.provider}</p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {format(apt.datetime, "EEEE, MMMM d · h:mm a")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {apt.repeat !== "none" && (
                        <span className="badge bg-teal-100 text-teal-700">
                          Repeats {apt.repeat}
                        </span>
                      )}
                      {apt.endDate && (
                        <span className="text-xs text-slate-400">
                          Until {format(new Date(apt.endDate), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
