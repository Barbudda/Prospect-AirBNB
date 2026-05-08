"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { generateOutreachMessage } from "@/lib/services/outreachGenerator";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  ExternalLink,
  Copy,
  CheckCheck,
  Plus,
  Trash2,
  Save,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

type Note = { id: string; content: string; createdAt: string };
type Prospect = {
  id: string;
  name: string;
  city: string;
  country: string;
  targetType: string;
  description: string | null;
  source: string;
  sourceUrl: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  priority: string;
  status: string;
  confidence: string;
  interestLevel: string | null;
  willingToPay: boolean;
  notes: string | null;
  nextFollowUpDate: string | null;
  createdAt: string;
  updatedAt: string;
  prospectNotes: Note[];
};

const STATUS_OPTIONS = [
  "new", "to_contact", "contacted", "replied",
  "meeting_scheduled", "interested", "willing_to_pay", "not_interested",
];

const PRIORITY_OPTIONS = ["high", "medium", "low"];
const INTEREST_OPTIONS = ["unknown", "low", "medium", "high"];

function Field({ label, value, href }: { label: string; value: string | null | undefined; href?: string }) {
  if (!value) return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-400 dark:text-slate-500">Not found</div>
    </div>
  );
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</div>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer"
          className="mt-1 flex items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400 break-all">
          {value} <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>
      ) : (
        <div className="mt-1 text-sm text-slate-800 dark:text-slate-200 break-all">{value}</div>
      )}
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/[0.08]">
      {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : `Copy ${label}`}
    </button>
  );
}

export default function ProspectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [outreachTab, setOutreachTab] = useState<"email" | "short" | "dm">("email");

  const [edits, setEdits] = useState<Partial<Prospect>>({});

  useEffect(() => {
    fetch(`/api/prospects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProspect(data.prospect);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <AppShell title="Loading..." subtitle="">
      <div className="p-12 text-center text-sm text-slate-400">Loading prospect...</div>
    </AppShell>
  );

  if (!prospect) return (
    <AppShell title="Not found" subtitle="">
      <div className="p-12 text-center">
        <p className="text-sm text-slate-500">Prospect not found.</p>
        <Link href="/contacts" className="mt-3 inline-flex text-sm text-blue-600 hover:underline">
          Back to Contacts
        </Link>
      </div>
    </AppShell>
  );

  const current = { ...prospect, ...edits };

  const outreach = generateOutreachMessage({
    name: current.name,
    city: current.city,
    targetType: current.targetType,
    email: current.email,
    phone: current.phone,
    instagram: current.instagram,
  });

  const handleSave = async () => {
    if (Object.keys(edits).length === 0) return;
    setSaving(true);
    const res = await fetch(`/api/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edits),
    });
    const data = await res.json();
    setProspect(data.prospect);
    setEdits({});
    setSaving(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    const res = await fetch(`/api/prospects/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNote.trim() }),
    });
    const data = await res.json();
    setProspect((prev) =>
      prev ? { ...prev, prospectNotes: [...prev.prospectNotes, data.note] } : prev
    );
    setNewNote("");
    setAddingNote(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    await fetch(`/api/prospects/${id}/notes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId }),
    });
    setProspect((prev) =>
      prev ? { ...prev, prospectNotes: prev.prospectNotes.filter((n) => n.id !== noteId) } : prev
    );
  };

  const handleDelete = async () => {
    if (!confirm("Delete this contact permanently?")) return;
    await fetch(`/api/prospects/${id}`, { method: "DELETE" });
    router.push("/contacts");
  };

  const hasEdits = Object.keys(edits).length > 0;

  return (
    <AppShell
      title={current.name}
      subtitle={`${current.city}, ${current.country} · ${current.targetType.replace("_", " ")}`}
      action={
        <div className="flex items-center gap-2">
          {hasEdits && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/30 dark:bg-transparent dark:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <div className="mb-6">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contacts
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Contact Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111]">
            <h2 className="mb-5 text-sm font-semibold text-slate-900 dark:text-white">
              Contact Information
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" value={current.name} />
              <Field label="City" value={`${current.city}, ${current.country}`} />
              <Field label="Type" value={current.targetType.replace("_", " ")} />
              <Field label="Source" value={current.source} />
              <Field label="Source URL" value={current.sourceUrl} href={current.sourceUrl} />
              {current.website && <Field label="Website" value={current.website} href={current.website} />}
              {current.email && <Field label="Email" value={current.email} href={`mailto:${current.email}`} />}
              {current.phone && <Field label="Phone" value={current.phone} href={`tel:${current.phone}`} />}
              {current.instagram && <Field label="Instagram" value={current.instagram} href={current.instagram} />}
              {current.facebook && <Field label="Facebook" value={current.facebook} href={current.facebook} />}
              {current.linkedin && <Field label="LinkedIn" value={current.linkedin} href={current.linkedin} />}
              {current.description && (
                <div className="sm:col-span-2">
                  <Field label="Description" value={current.description} />
                </div>
              )}
            </div>

            {/* Quick copy buttons */}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5 dark:border-white/5">
              {current.email && <CopyButton text={current.email} label="email" />}
              {current.phone && <CopyButton text={current.phone} label="phone" />}
              {current.sourceUrl && (
                <a
                  href={current.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open source
                </a>
              )}
            </div>
          </div>

          {/* Outreach Messages */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111]">
            <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
              Outreach Message
            </h2>
            <div className="flex gap-2 mb-4">
              {(["email", "short", "dm"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setOutreachTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    outreachTab === tab
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                  }`}
                >
                  {tab === "email" ? "Email" : tab === "short" ? "Short" : "DM / Instagram"}
                </button>
              ))}
            </div>
            <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-white/[0.03] dark:text-slate-300">
              {outreach[outreachTab]}
            </pre>
            <div className="mt-3 flex gap-2">
              <CopyButton text={outreach[outreachTab]} label="message" />
              {current.email && (
                <a
                  href={`mailto:${current.email}?subject=Outil%20de%20conciergerie%20IA&body=${encodeURIComponent(outreach.email)}`}
                  className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Open in email
                </a>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111]">
            <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Notes</h2>
            <div className="space-y-3 mb-4">
              {prospect.prospectNotes.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">No notes yet.</p>
              )}
              {prospect.prospectNotes.map((note) => (
                <div
                  key={note.id}
                  className="group flex items-start gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/5"
                >
                  <p className="flex-1 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-400">
                      {new Date(note.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={2}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || addingNote}
                className="flex items-center gap-1.5 self-end rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Right column — Qualification */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111]">
            <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
              Qualification
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Status
                </label>
                <select
                  value={edits.status ?? current.status}
                  onChange={(e) => setEdits({ ...edits, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Priority
                </label>
                <select
                  value={edits.priority ?? current.priority}
                  onChange={(e) => setEdits({ ...edits, priority: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Interest Level
                </label>
                <select
                  value={edits.interestLevel ?? current.interestLevel ?? "unknown"}
                  onChange={(e) => setEdits({ ...edits, interestLevel: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5"
                >
                  {INTEREST_OPTIONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(edits.willingToPay ?? current.willingToPay) as boolean}
                    onChange={(e) => setEdits({ ...edits, willingToPay: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Willing to pay
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={
                    (edits.nextFollowUpDate ?? current.nextFollowUpDate)
                      ? new Date(
                          edits.nextFollowUpDate ?? current.nextFollowUpDate!
                        ).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEdits({ ...edits, nextFollowUpDate: e.target.value || null })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-white/5"
                />
              </div>

              {hasEdits && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111]">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence</span>
                <span className={`font-semibold ${
                  current.confidence === "high" ? "text-emerald-500" :
                  current.confidence === "medium" ? "text-amber-500" : "text-slate-400"
                }`}>{current.confidence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Added</span>
                <span className="text-slate-600 dark:text-slate-300">
                  {new Date(current.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Updated</span>
                <span className="text-slate-600 dark:text-slate-300">
                  {new Date(current.updatedAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>

          {/* Social links quick access */}
          {(current.instagram || current.facebook || current.linkedin) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111]">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Social</h3>
              <div className="flex flex-col gap-2">
                {current.instagram && (
                  <a href={current.instagram} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-pink-600 hover:underline dark:text-pink-400">
                    <Instagram className="h-4 w-4" /> Instagram
                  </a>
                )}
                {current.facebook && (
                  <a href={current.facebook} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400">
                    <Facebook className="h-4 w-4" /> Facebook
                  </a>
                )}
                {current.linkedin && (
                  <a href={current.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-700 hover:underline dark:text-blue-300">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
