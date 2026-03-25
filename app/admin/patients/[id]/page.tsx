"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { formatDateOnly } from "@/lib/dateUtils";

const MEDICATIONS = ["Diovan", "Lexapro", "Metformin", "Ozempic", "Prozac", "Seroquel", "Tegretol"];
const DOSAGES = ["1mg", "2mg", "3mg", "5mg", "10mg", "25mg", "50mg", "100mg", "250mg", "500mg", "1000mg"];

interface Patient {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  appointments: Appointment[];
  prescriptions: Prescription[];
}

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

type ModalType =
  | { kind: "editPatient" }
  | { kind: "addAppointment" }
  | { kind: "editAppointment"; apt: Appointment }
  | { kind: "addPrescription" }
  | { kind: "editPrescription"; rx: Prescription }
  | null;

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadPatient = () => {
    fetch(`/api/patients/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPatient(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPatient();
  }, [id]);

  const closeModal = () => {
    setModal(null);
    setError("");
  };

  if (loading) {
    return <div className="text-center py-12 text-teal-600">Loading patient...</div>;
  }

  if (!patient) {
    return <div className="text-center py-12 text-slate-500">Patient not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin" className="hover:text-teal-600">Patients</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{patient.name}</span>
      </div>

      {/* Patient Info */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-teal-700 font-bold text-xl">
                {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
              <p className="text-slate-500">{patient.email}</p>
              <p className="text-xs text-slate-400 mt-1">
                Patient since {format(new Date(patient.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setModal({ kind: "editPatient" })}
            className="btn-secondary text-sm"
          >
            Edit Patient
          </button>
        </div>
      </div>

      {/* Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Appointments
          </h2>
          <button
            onClick={() => setModal({ kind: "addAppointment" })}
            className="btn-primary text-sm py-1.5"
          >
            + Add Appointment
          </button>
        </div>

        {patient.appointments.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No appointments scheduled</p>
        ) : (
          <div className="space-y-3">
            {patient.appointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-teal-700 leading-none">
                    {format(new Date(apt.datetime), "d")}
                  </span>
                  <span className="text-xs text-teal-600 leading-none">
                    {format(new Date(apt.datetime), "MMM")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800">{apt.provider}</p>
                  <p className="text-sm text-slate-500">
                    {format(new Date(apt.datetime), "EEEE, MMMM d, yyyy · h:mm a")}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge bg-teal-100 text-teal-700">{apt.repeat}</span>
                    {apt.endDate && (
                      <span className="text-xs text-slate-400">
                        Ends {format(new Date(apt.endDate), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModal({ kind: "editAppointment", apt })}
                    className="btn-secondary text-xs py-1 px-3"
                  >
                    Edit
                  </button>
                  <DeleteButton
                    onConfirm={async () => {
                      await fetch(`/api/patients/${id}/appointments/${apt.id}`, { method: "DELETE" });
                      loadPatient();
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescriptions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Prescriptions
          </h2>
          <button
            onClick={() => setModal({ kind: "addPrescription" })}
            className="btn-primary text-sm py-1.5"
          >
            + Add Prescription
          </button>
        </div>

        {patient.prescriptions.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No prescriptions on file</p>
        ) : (
          <div className="space-y-3">
            {patient.prescriptions.map((rx) => (
              <div key={rx.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800">{rx.medication}</p>
                  <p className="text-sm text-slate-500">
                    {rx.dosage} · Qty: {rx.quantity} · Refill: {formatDateOnly(rx.refillOn)}
                  </p>
                  <span className="badge bg-blue-100 text-blue-700 mt-1">{rx.refillSchedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModal({ kind: "editPrescription", rx })}
                    className="btn-secondary text-xs py-1 px-3"
                  >
                    Edit
                  </button>
                  <DeleteButton
                    onConfirm={async () => {
                      await fetch(`/api/patients/${id}/prescriptions/${rx.id}`, { method: "DELETE" });
                      loadPatient();
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <Modal onClose={closeModal}>
          {modal.kind === "editPatient" && (
            <EditPatientForm
              patient={patient}
              onSave={async (data) => {
                setSaving(true);
                setError("");
                const res = await fetch(`/api/patients/${id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                setSaving(false);
                if (res.ok) { loadPatient(); closeModal(); }
                else setError("Failed to update patient");
              }}
              saving={saving}
              error={error}
            />
          )}
          {(modal.kind === "addAppointment" || modal.kind === "editAppointment") && (
            <AppointmentForm
              appointment={modal.kind === "editAppointment" ? modal.apt : null}
              onSave={async (data) => {
                setSaving(true);
                setError("");
                const url = modal.kind === "editAppointment"
                  ? `/api/patients/${id}/appointments/${modal.apt.id}`
                  : `/api/patients/${id}/appointments`;
                const method = modal.kind === "editAppointment" ? "PUT" : "POST";
                const res = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                setSaving(false);
                if (res.ok) { loadPatient(); closeModal(); }
                else setError("Failed to save appointment");
              }}
              saving={saving}
              error={error}
            />
          )}
          {(modal.kind === "addPrescription" || modal.kind === "editPrescription") && (
            <PrescriptionForm
              prescription={modal.kind === "editPrescription" ? modal.rx : null}
              onSave={async (data) => {
                setSaving(true);
                setError("");
                const url = modal.kind === "editPrescription"
                  ? `/api/patients/${id}/prescriptions/${modal.rx.id}`
                  : `/api/patients/${id}/prescriptions`;
                const method = modal.kind === "editPrescription" ? "PUT" : "POST";
                const res = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                setSaving(false);
                if (res.ok) { loadPatient(); closeModal(); }
                else setError("Failed to save prescription");
              }}
              saving={saving}
              error={error}
            />
          )}
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={() => { onConfirm(); setConfirming(false); }} className="btn-danger text-xs py-1 px-3">
          Confirm
        </button>
        <button onClick={() => setConfirming(false)} className="btn-secondary text-xs py-1 px-3">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-red-500 hover:text-red-700 text-xs py-1 px-3 rounded-lg hover:bg-red-50 transition-colors">
      Delete
    </button>
  );
}

function EditPatientForm({
  patient,
  onSave,
  saving,
  error,
}: {
  patient: Patient;
  onSave: (data: { name: string; email: string; password?: string }) => void;
  saving: boolean;
  error: string;
}) {
  const [name, setName] = useState(patient.name);
  const [email, setEmail] = useState(patient.email);
  const [password, setPassword] = useState("");

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave({ name, email, ...(password ? { password } : {}) }); }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-slate-800">Edit Patient</h3>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="label">Full Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
      </div>
      <div>
        <label className="label">New Password <span className="text-slate-400">(leave blank to keep current)</span></label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function AppointmentForm({
  appointment,
  onSave,
  saving,
  error,
}: {
  appointment: Appointment | null;
  onSave: (data: { provider: string; datetime: string; repeat: string; endDate?: string }) => void;
  saving: boolean;
  error: string;
}) {
  const [provider, setProvider] = useState(appointment?.provider || "");
  const [datetime, setDatetime] = useState(
    appointment ? format(new Date(appointment.datetime), "yyyy-MM-dd'T'HH:mm") : ""
  );
  const [repeat, setRepeat] = useState(appointment?.repeat || "none");
  const [endDate, setEndDate] = useState(
    appointment?.endDate ? format(new Date(appointment.endDate), "yyyy-MM-dd") : ""
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ provider, datetime, repeat, ...(endDate ? { endDate } : {}) });
      }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-slate-800">
        {appointment ? "Edit Appointment" : "New Appointment"}
      </h3>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="label">Provider Name</label>
        <input
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="input-field"
          placeholder="Dr. Jane Smith"
          required
        />
      </div>
      <div>
        <label className="label">Date & Time</label>
        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="label">Repeat Schedule</label>
        <select value={repeat} onChange={(e) => setRepeat(e.target.value)} className="input-field">
          <option value="none">No repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      {repeat !== "none" && (
        <div>
          <label className="label">End Date <span className="text-slate-400">(optional)</span></label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
          />
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
          {saving ? "Saving..." : appointment ? "Save Changes" : "Add Appointment"}
        </button>
      </div>
    </form>
  );
}

function PrescriptionForm({
  prescription,
  onSave,
  saving,
  error,
}: {
  prescription: Prescription | null;
  onSave: (data: { medication: string; dosage: string; quantity: number; refillOn: string; refillSchedule: string }) => void;
  saving: boolean;
  error: string;
}) {
  const [medication, setMedication] = useState(prescription?.medication || MEDICATIONS[0]);
  const [dosage, setDosage] = useState(prescription?.dosage || DOSAGES[0]);
  const [quantity, setQuantity] = useState(prescription?.quantity || 1);
  const [refillOn, setRefillOn] = useState(
    prescription ? formatDateOnly(prescription.refillOn, "yyyy-MM-dd") : ""
  );
  const [refillSchedule, setRefillSchedule] = useState(prescription?.refillSchedule || "monthly");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ medication, dosage, quantity, refillOn, refillSchedule });
      }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-slate-800">
        {prescription ? "Edit Prescription" : "New Prescription"}
      </h3>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="label">Medication</label>
        <select value={medication} onChange={(e) => setMedication(e.target.value)} className="input-field">
          {MEDICATIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Dosage</label>
          <select value={dosage} onChange={(e) => setDosage(e.target.value)} className="input-field">
            {DOSAGES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="input-field"
            required
          />
        </div>
      </div>
      <div>
        <label className="label">Next Refill Date</label>
        <input
          type="date"
          value={refillOn}
          onChange={(e) => setRefillOn(e.target.value)}
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="label">Refill Schedule</label>
        <select value={refillSchedule} onChange={(e) => setRefillSchedule(e.target.value)} className="input-field">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
          {saving ? "Saving..." : prescription ? "Save Changes" : "Add Prescription"}
        </button>
      </div>
    </form>
  );
}
