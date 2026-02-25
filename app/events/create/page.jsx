"use client";

import { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    quota: 50,
    status: "DRAFT",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quota" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New event:", formData);
    // In a real app, this would send to backend
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <a href="/events" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold">
            <ArrowLeftIcon className="w-4 h-4" strokeWidth={2.5} />
            Kembali ke Events
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-black" style={{ boxShadow: '8px 8px 0 #000' }}>
          <h1 className="text-3xl font-bold mb-6 font-fredoka">Buat Event Baru</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Event</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Masukkan judul event"
                className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Jelaskan tentang event Anda"
                rows="4"
                className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Waktu</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Tempat diadakan event"
                className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kuota Peserta</label>
                <input
                  type="number"
                  name="quota"
                  value={formData.quota}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg border-2 border-black hover:bg-indigo-700 transition-colors"
              style={{ boxShadow: '4px 4px 0 #000' }}
            >
              Buat Event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
