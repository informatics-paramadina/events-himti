"use client";

import { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_event: "",
    deskripsi: "",
    tanggal: "",
    jam: "",
    lokasi: "",
    kapasitas: 50,
    status: "DRAFT",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFormData(prev => ({
      ...prev,
      [name]: name === "kapasitas" ? (value === "" ? "" : parseInt(value, 10) || 0) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validasi form
      if (!formData.nama_event || !formData.deskripsi || !formData.tanggal || !formData.jam || !formData.lokasi || !formData.kapasitas) {
        setError("Semua field harus diisi");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_event: formData.nama_event,
          deskripsi: formData.deskripsi,
          tanggal: formData.tanggal,
          jam: formData.jam,
          lokasi: formData.lokasi,
          kapasitas: parseInt(formData.kapasitas, 10),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal membuat event");
      }

      const newEvent = await response.json();
      alert("Event berhasil dibuat!");
      router.push("/events");
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.message || "Terjadi kesalahan saat membuat event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <a href="/events" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold">
            <ArrowLeftIcon className="w-4 h-4" strokeWidth={2.5} />
            Kembali ke Events
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-black" style={{ boxShadow: '8px 8px 0 #000' }}>
          <h1 className="text-3xl font-bold mb-6 font-fredoka">Buat Event Baru</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Event</label>
              <input
                type="text"
                name="nama_event"
                value={formData.nama_event}
                onChange={handleChange}
                placeholder="Masukkan judul event"
                className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                placeholder="Jelaskan tentang event Anda"
                rows="4"
                className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Waktu</label>
                <input
                  type="time"
                  name="jam"
                  value={formData.jam}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi</label>
              <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleChange}
                placeholder="Tempat diadakan event"
                className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kuota Peserta</label>
                <input
                  type="number"
                  name="kapasitas"
                  value={formData.kapasitas}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg border-2 border-black hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              style={{ boxShadow: '4px 4px 0 #000' }}
            >
              {loading ? "Membuat Event..." : "Buat Event"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
