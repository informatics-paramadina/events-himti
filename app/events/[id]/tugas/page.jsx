"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');
  .font-fredoka { font-family: 'Fredoka', sans-serif; }
  .b-border    { border: 3px solid #1a1a1a; }
  .b-shadow    { box-shadow: 8px 8px 0px #1a1a1a; }
  .b-shadow-sm { box-shadow: 4px 4px 0px #1a1a1a; }
  .b-btn       { transition: all 0.12s ease; }
  .b-btn:hover { transform: translate(2px,2px); box-shadow: 0px 0px 0px #1a1a1a !important; }
  .bg-dots { background-image: radial-gradient(circle, #1a1a1a 1px, transparent 1px); background-size: 24px 24px; opacity: 0.04; pointer-events: none; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes popIn { 0%{transform:scale(0.5) rotate(-8deg);opacity:0} 65%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
  .t-fadeUp { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
  .t-popIn  { animation: popIn 0.6s cubic-bezier(.34,1.56,.64,1) both; }
`;

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl text-sm font-bold placeholder-slate-300 focus:outline-none transition-all b-border bg-white text-slate-900";
const inputStyle = { boxShadow: "3px 3px 0 #1a1a1a" };

export default function TugasPage() {
  const params = useParams();
  const eventId = params.id;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ email: "", nim: "", file: null });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) throw new Error("Event tidak ditemukan");
        setEvent(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  const handleChange = (key, value) => {
    setError("");
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setProcessing(true);
    try {
      if (!formData.email || !formData.file) {
        throw new Error("Email dan file tugas wajib diisi");
      }
      const form = new FormData();
      form.append("email", formData.email);
      form.append("nim", formData.nim);
      form.append("file", formData.file);

      const res = await fetch(`/api/events/${eventId}/tugas`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengumpulkan tugas");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const deadlinePassed =
    event?.deadlineTugas && new Date() > new Date(event.deadlineTugas);

  const shell = (children) => (
    <div className="min-h-screen" style={{ background: "#FEFEFE" }}>
      <style>{CSS}</style>
      <div className="fixed inset-0 bg-dots" />
      <div className="relative overflow-hidden" style={{ background: "#2AAF15" }}>
        <div
          className="font-fredoka absolute right-4 -bottom-6 font-bold text-white/10 leading-none select-none pointer-events-none"
          style={{ fontSize: "clamp(8rem, 22vw, 16rem)" }}
        >
          ✓
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <a
            href={`/events/${eventId}`}
            className="b-btn b-border inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-2xl text-sm font-black w-fit uppercase tracking-wider mb-8"
            style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
          >
            <ArrowLeftIcon className="w-4 h-4" strokeWidth={3} /> Kembali ke Event
          </a>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">
            Tugas Pasca-Acara
          </p>
          <h1
            className="font-fredoka text-3xl sm:text-4xl font-bold text-white"
            style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.15)" }}
          >
            Kumpulkan Tugas<span className="text-black">.</span>
          </h1>
          {event && (
            <p className="text-white/80 font-bold text-sm mt-2">{event.nama_event}</p>
          )}
        </div>
      </div>
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-12">
        {children}
      </div>
    </div>
  );

  if (loading) {
    return shell(
      <div className="t-fadeUp bg-white b-border b-shadow rounded-[2rem] p-10 text-center">
        <p className="font-fredoka text-xl font-bold text-slate-900">Memuat...</p>
      </div>,
    );
  }

  if (!event) {
    return shell(
      <div className="t-fadeUp bg-white b-border b-shadow rounded-[2rem] p-10 text-center">
        <p className="font-fredoka text-xl font-bold text-slate-900">Event tidak ditemukan</p>
      </div>,
    );
  }

  if (!event.adaTugas) {
    return shell(
      <div className="t-fadeUp bg-white b-border b-shadow rounded-[2rem] p-10 text-center">
        <p className="font-fredoka text-xl font-bold text-slate-900">Tidak ada tugas</p>
        <p className="text-sm font-bold text-slate-400 mt-2">
          Event ini tidak memiliki tugas yang perlu dikumpulkan.
        </p>
      </div>,
    );
  }

  /* ===== SUCCESS ===== */
  if (result) {
    return shell(
      <div className="t-fadeUp bg-white b-border b-shadow overflow-hidden rounded-[2rem]">
        <div className="relative px-6 py-10 text-center" style={{ background: "#2AAF15" }}>
          <div
            className="t-popIn w-[72px] h-[72px] bg-white b-border flex items-center justify-center mx-auto mb-4 rounded-2xl"
            style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
          >
            <CheckBadgeIcon className="w-9 h-9" style={{ color: "#2AAF15" }} />
          </div>
          <h3 className="font-fredoka text-2xl font-bold text-white mb-1">
            Tugas Berhasil Terkumpul!
          </h3>
          <p className="text-white/90 text-sm font-semibold">
            Terima kasih telah menyelesaikan tugas event ini
          </p>
        </div>
        <div className="p-6 space-y-4">
          {/* Card Info Pembagian Sertifikat via Google Drive & WA */}
          <div className="p-5 bg-amber-50 b-border rounded-2xl border-amber-300 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <p className="text-xs font-black text-amber-900 uppercase tracking-wider">
                Informasi Sertifikat Kegiatan
              </p>
            </div>
            <p className="text-xs font-bold text-amber-900 leading-relaxed">
              Sertifikat akan dibagikan oleh panitia melalui tautan folder <strong>Google Drive</strong> via <strong>WhatsApp (WA)</strong> setelah seluruh tugas direkap dan divalidasi.
            </p>
            <p className="text-[11px] text-amber-800 font-medium">
              Pastikan nomor WhatsApp yang kamu daftarkan tetap aktif untuk menerima link sertifikat.
            </p>
          </div>

          {result.fileUrl && (
            <a
              href={result.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="b-btn b-border flex items-center justify-center w-full gap-2 py-3.5 rounded-2xl text-sm font-black text-slate-800 bg-white uppercase tracking-widest"
              style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
            >
              <DocumentTextIcon className="w-4 h-4" /> Lihat File Tugas Kamu
            </a>
          )}

          <div className="flex items-center gap-2.5 bg-green-50 b-border rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-green-800">
              ✓ Konfirmasi pengumpulan tugas juga telah dikirim ke email kamu
            </p>
          </div>
        </div>
      </div>,
    );
  }

  /* ===== FORM ===== */
  return shell(
    <div className="t-fadeUp bg-white b-border b-shadow overflow-hidden rounded-[2rem]">
      <div className="p-6 sm:p-8 space-y-5">
        {/* Info tugas */}
        <div className="bg-slate-50 b-border rounded-2xl p-4 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {event.judulTugas || "Tugas"}
          </p>
          {event.deskripsiTugas && (
            <p className="text-sm font-medium text-slate-600 whitespace-pre-line">
              {event.deskripsiTugas}
            </p>
          )}
          {event.deadlineTugas && (
            <div className="flex items-center gap-2 text-xs font-black text-slate-500 pt-1">
              <ClockIcon className="w-4 h-4" />
              Deadline:{" "}
              {new Date(event.deadlineTugas).toLocaleString("id-ID", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </div>
          )}
        </div>

        {deadlinePassed ? (
          <div className="p-4 bg-red-100 b-border rounded-2xl text-red-700 text-sm font-bold">
            Batas waktu pengumpulan tugas sudah berakhir.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 text-sm font-bold">
                {error}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                Email Terdaftar <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="nama@email.com"
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                NIM
              </label>
              <input
                type="text"
                value={formData.nim}
                onChange={(e) => handleChange("nim", e.target.value)}
                placeholder="Nomor Induk Mahasiswa"
                className={inputClass}
                style={inputStyle}
              />
              <p className="text-[11px] text-slate-400 mt-1 font-bold">
                Wajib cocok dengan data pendaftaran (jika memiliki NIM)
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                File Tugas (PDF / Gambar) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => handleChange("file", e.target.files[0])}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-bold bg-white b-border"
                style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
              />
              <p className="text-[11px] text-slate-400 mt-1 font-bold">Maksimal 10 MB</p>
            </div>
            <button
              type="submit"
              disabled={processing}
              className="b-btn b-border w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest"
              style={{ background: "#2AAF15", boxShadow: "4px 4px 0 #1a1a1a" }}
            >
              {processing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengumpulkan...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-5 h-5" strokeWidth={2.5} /> Kumpulkan Tugas
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>,
  );
}