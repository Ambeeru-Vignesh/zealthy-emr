"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { format, addDays } from "date-fns";
import { getPrescriptionRefills } from "@/lib/recurrence";
import { formatDateOnly } from "@/lib/dateUtils";

interface Prescription {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: string;
  refillSchedule: string;
}

export default function PrescriptionsPage() {
  const { data: session } = useSession();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      const userId = (session.user as { id?: string }).id;
      fetch(`/api/patients/${userId}/prescriptions`)
        .then((r) => r.json())
        .then((data) => {
          setPrescriptions(data);
          setLoading(false);
        });
    }
  }, [session]);

  if (loading) {
    return <div className="text-center py-20 text-teal-600">Loading prescriptions...</div>;
  }

  const now = new Date();
  const in3Months = addDays(now, 90);
  const refills = getPrescriptionRefills(prescriptions, now, in3Months);

  const grouped: Record<string, typeof refills> = {};
  for (const r of refills) {
    const key = format(r.refillOn, "MMMM yyyy");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Prescriptions & Refills</h1>
        <p className="text-slate-500 mt-1">Your medication schedule for the next 3 months</p>
      </div>

      {/* Current Prescriptions Summary */}
      <div className="card">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Current Prescriptions</h2>
        {prescriptions.length === 0 ? (
          <p className="text-slate-400 text-sm">No prescriptions on file</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{rx.medication}</p>
                    <p className="text-sm text-slate-500">{rx.dosage} · Qty: {rx.quantity}</p>
                  </div>
                  <span className="badge bg-blue-100 text-blue-700">{rx.refillSchedule}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Next refill: {formatDateOnly(rx.refillOn)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refill Schedule */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Upcoming Refill Schedule</h2>

        {refills.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-400">No refills scheduled in the next 3 months</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([month, rxs]) => (
              <div key={month}>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {month}
                </h3>
                <div className="space-y-2">
                  {rxs.map((rx, i) => (
                    <div key={i} className="card flex items-center gap-4 py-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-blue-50 rounded-xl flex flex-col items-center justify-center border border-blue-100">
                        <span className="text-xl font-bold text-blue-700 leading-none">
                          {format(rx.refillOn, "d")}
                        </span>
                        <span className="text-xs text-blue-600 leading-none mt-0.5">
                          {format(rx.refillOn, "EEE")}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{rx.medication}</p>
                        <p className="text-sm text-slate-500">
                          {rx.dosage} · Qty: {rx.quantity} · {format(rx.refillOn, "MMMM d, yyyy")}
                        </p>
                      </div>
                      <span className="badge bg-blue-100 text-blue-700">
                        {rx.refillSchedule}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
