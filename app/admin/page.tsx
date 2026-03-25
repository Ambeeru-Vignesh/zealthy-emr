"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

interface Patient {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  _count: { appointments: number; prescriptions: number };
}

export default function AdminDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadPatients = () => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data) => {
        setPatients(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Records</h1>
          <p className="text-slate-500 mt-1">{patients.length} patients in the system</p>
        </div>
        <Link href="/admin/patients/new" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Patient
        </Link>
      </div>

      <div className="card p-4">
        <input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-md"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-teal-600">Loading patients...</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Patient</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Email</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Appts</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Rx</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Member Since</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No patients found
                  </td>
                </tr>
              ) : (
                filtered.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-teal-700 font-semibold text-sm">
                            {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <span className="font-medium text-slate-800">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{patient.email}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="badge bg-teal-100 text-teal-700">
                        {patient._count.appointments}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="badge bg-blue-100 text-blue-700">
                        {patient._count.prescriptions}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(patient.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/patients/${patient.id}`}
                        className="text-teal-600 hover:text-teal-800 font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
