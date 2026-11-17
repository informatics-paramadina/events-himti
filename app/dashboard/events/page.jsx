"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  ClipboardDocumentCheckIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function ManageEventsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, upcoming, past
  const [typeFilter, setTypeFilter] = useState("all"); // all, free, paid
  const [tugasFilter, setTugasFilter] = useState("all"); // all, withTugas, withoutTugas

  // Action states
  const [deletingId, setDeletingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("dashboard_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchEventsData();
    } else {
      setShowPasswordModal(true);
      setLoading(false);
    }
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("dashboard_authenticated", "true");
        setIsAuthenticated(true);
        setShowPasswordModal(false);
        setPasswordError("");
        fetchEventsData();
        return;
      }
      setPasswordError(data.message || "Password salah! Silakan coba lagi.");
    } catch {
      setPasswordError("Gagal memverifikasi password. Periksa koneksi Anda.");
    }
    setPasswordInput("");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("dashboard_authenticated");
    setIsAuthenticated(false);
    setShowPasswordModal(true);
    setPasswordInput("");
  };

  async function fetchEventsData() {
    try {
      setLoading(true);

      const [eventsRes, participantsRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/participants"),
      ]);

      if (!eventsRes.ok) throw new Error("Gagal mengambil data event");
      const eventsData = await eventsRes.json();
      const participantsData = participantsRes.ok
        ? await participantsRes.json()
        : [];

      const enriched = Array.isArray(eventsData)
        ? eventsData.map((ev) => {
            const count = Array.isArray(participantsData)
              ? participantsData.filter((p) => p.eventId === ev.id).length
              : ev.participants?.length || 0;
            return {
              ...ev,
              participantCount: count,
            };
          })
        : [];

      // Sort by tanggal (upcoming/newest first)
      enriched.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      setEvents(enriched);
      setFilteredEvents(enriched);
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter effect
  useEffect(() => {
    const now = new Date();
    let result = [...events];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.nama_event?.toLowerCase().includes(q) ||
          e.lokasi?.toLowerCase().includes(q) ||
          e.deskripsi?.toLowerCase().includes(q),
      );
    }

    if (statusFilter === "upcoming") {
      result = result.filter((e) => new Date(e.tanggal) >= now);
    } else if (statusFilter === "past") {
      result = result.filter((e) => new Date(e.tanggal) < now);
    }

    if (typeFilter === "free") {
      result = result.filter((e) => !e.isPaidEvent);
    } else if (typeFilter === "paid") {
      result = result.filter((e) => e.isPaidEvent);
    }

    if (tugasFilter === "withTugas") {
      result = result.filter((e) => e.adaTugas);
    } else if (tugasFilter === "withoutTugas") {
      result = result.filter((e) => !e.adaTugas);
    }

    setFilteredEvents(result);
  }, [search, statusFilter, typeFilter, tugasFilter, events]);

  // Export excel
  async function handleExportExcel(eventId, eventName) {
    try {
      setExportingId(eventId);
      const response = await fetch(`/api/events/${eventId}/export`);

      if (!response.ok) {
        let errorMessage = "Export gagal";
        try {
          const err = await response.json();
          errorMessage = err.message || err.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `peserta_${eventName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setExportingId(null);
    }
  }

  // Delete event
  async function handleDeleteEvent(eventId, eventName) {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus event "${eventName}"?\nSemua data pendaftaran dan tugas peserta terkait akan ikut terhapus secara permanen.`,
      )
    ) {
      return;
    }

    try {
      setDeletingId(eventId);
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Gagal menghapus event");
      }

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      alert("✅ Event berhasil dihapus!");
    } catch (err) {
      alert("❌ Gagal menghapus event: " + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // Open edit modal
  function openEditModal(event) {
    setEditingEvent(event);
    setEditFormData({
      nama_event: event.nama_event || "",
      deskripsi: event.deskripsi || "",
      tanggal: event.tanggal ? event.tanggal.split("T")[0] : "",
      jam_mulai: event.jam_mulai || "",
      jam_berakhir: event.jam_berakhir || "",
      lokasi: event.lokasi || "",
      kapasitas: event.kapasitas || "",
      isPaidEvent: event.isPaidEvent || false,
      adaTugas: event.adaTugas || false,
      judulTugas: event.judulTugas || "",
      deskripsiTugas: event.deskripsiTugas || "",
      deadlineTugas: event.deadlineTugas
        ? event.deadlineTugas.split("T")[0]
        : "",
    });
    setShowEditModal(true);
  }

  function closeEditModal() {
    setShowEditModal(false);
    setEditingEvent(null);
    setEditFormData({});
  }

  // Submit edit
  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      setSavingEdit(true);
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menyimpan perubahan");
      }

      const updated = await res.json();
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingEvent.id
            ? { ...ev, ...updated, participantCount: ev.participantCount }
            : ev,
        ),
      );
      closeEditModal();
      alert("✅ Event berhasil diperbarui!");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  // Stats calculation
  const totalEvents = events.length;
  const upcomingCount = events.filter(
    (e) => new Date(e.tanggal) >= new Date(),
  ).length;
  const totalParticipants = events.reduce(
    (acc, cur) => acc + (cur.participantCount || 0),
    0,
  );
  const withTugasCount = events.filter((e) => e.adaTugas).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-sm font-semibold text-gray-600">
            Memuat Manajemen Event...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Password Modal if not authenticated */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold text-2xl">
                🔐
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Akses Kelola Events
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Masukkan password admin HIMTI untuk mengelola kegiatan event
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Masukkan password admin..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    {passwordError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
              >
                Masuk ke Kelola Events
              </button>
              <div className="text-center pt-2">
                <Link
                  href="/dashboard"
                  className="text-xs text-gray-500 hover:text-gray-800 font-medium"
                >
                  ← Kembali ke Dashboard
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/dashboard"
                  className="text-xs text-green-600 hover:text-green-800 font-bold flex items-center gap-1"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" /> Dashboard
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-xs text-gray-500 font-semibold">
                  Kelola Events
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Kelola Events HIMTI
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
                Pusat manajemen kegiatan, kuota peserta, tugas, dan detail acara
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/events/create"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition shadow-xs"
              >
                <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                Buat Event Baru
              </Link>

              <Link
                href="/dashboard/participants"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-sm font-bold transition border border-purple-200"
              >
                <UsersIcon className="w-4 h-4" />
                Kelola Peserta
              </Link>

              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition"
                title="Buka halaman publik / landing page"
              >
                <EyeIcon className="w-4 h-4" />
                Halaman Publik
              </Link>

              <button
                onClick={handleLogout}
                className="p-2.5 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Events
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                {totalEvents}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Event Mendatang
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-green-600 mt-1">
                {upcomingCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Pendaftar
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-1">
                {totalParticipants}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Event Ada Tugas
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
                {withTugasCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <ClipboardDocumentCheckIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="md:col-span-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari event atau lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Semua Status Waktu</option>
                <option value="upcoming">🟢 Event Mendatang / Aktif</option>
                <option value="past">⚪ Event Selesai / Lewat</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Semua Jenis Biaya</option>
                <option value="free">🎉 Gratis</option>
                <option value="paid">💳 Berbayar</option>
              </select>
            </div>

            {/* Tugas Filter */}
            <div>
              <select
                value={tugasFilter}
                onChange={(e) => setTugasFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Semua Tugas</option>
                <option value="withTugas">📝 Ada Tugas Pasca-Acara</option>
                <option value="withoutTugas">Tanpa Tugas</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
            <span>
              Menampilkan <strong>{filteredEvents.length}</strong> dari{" "}
              <strong>{events.length}</strong> event
            </span>
            {(search ||
              statusFilter !== "all" ||
              typeFilter !== "all" ||
              tugasFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setTugasFilter("all");
                }}
                className="text-green-600 hover:text-green-800 font-bold"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Events Cards Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">
              Tidak Ada Event yang Sesuai
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Coba ganti filter pencarian atau buat event baru untuk memulai.
            </p>
            <Link
              href="/events/create"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition"
            >
              <PlusIcon className="w-4 h-4" /> Buat Event Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const eventDate = new Date(event.tanggal);
              const isUpcoming = eventDate >= new Date();
              const filled = event.participantCount || 0;
              const quota = event.kapasitas || 0;
              const pct = quota > 0 ? Math.round((filled / quota) * 100) : 0;
              const isFull = quota > 0 && filled >= quota;

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isUpcoming ? (
                          <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-bold">
                            🟢 Mendatang
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold">
                            ⚪ Selesai
                          </span>
                        )}

                        {event.isPaidEvent ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-bold">
                            💳 Berbayar
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold">
                            🎉 Gratis
                          </span>
                        )}

                        {event.adaTugas && (
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[11px] font-bold flex items-center gap-1">
                            📝 Ada Tugas
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/events/${event.id}`}
                        target="_blank"
                        className="text-gray-400 hover:text-green-600 transition"
                        title="Buka halaman publik event"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Event Title & Description */}
                    <div>
                      <Link
                        href={`/events/${event.id}`}
                        className="text-lg font-bold text-gray-900 hover:text-green-600 transition line-clamp-2"
                      >
                        {event.nama_event}
                      </Link>
                      {event.deskripsi && (
                        <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {event.deskripsi}
                        </p>
                      )}
                    </div>

                    {/* Schedule & Location */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>
                          {eventDate.toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>
                          {event.jam_mulai} - {event.jam_berakhir} WIB
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">{event.lokasi}</span>
                      </div>
                    </div>

                    {/* Capacity Progress */}
                    {quota > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500 font-medium">
                            Kapasitas Peserta:
                          </span>
                          <span className="font-bold text-gray-800">
                            {filled} / {quota}{" "}
                            <span className="text-gray-400 font-normal">
                              ({pct}%)
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 100
                                ? "bg-red-500"
                                : pct >= 75
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(event)}
                        className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 transition shadow-2xs flex items-center gap-1"
                        title="Edit detail event"
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5 text-blue-600" />
                        Edit
                      </button>

                      {/* Kelola Peserta */}
                      <Link
                        href={`/dashboard/participants?event=${event.id}`}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border border-purple-200 transition flex items-center gap-1"
                        title="Lihat peserta event ini"
                      >
                        <UsersIcon className="w-3.5 h-3.5" />
                        Peserta ({filled})
                      </Link>

                      {/* Export Excel */}
                      <button
                        onClick={() =>
                          handleExportExcel(event.id, event.nama_event)
                        }
                        disabled={exportingId === event.id || filled === 0}
                        className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-lg border border-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        title="Download rekap Excel peserta"
                      >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        {exportingId === event.id ? "Export..." : "Excel"}
                      </button>

                      {/* Tugas */}
                      {event.adaTugas && (
                        <Link
                          href={`/events/${event.id}/tugas`}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 transition flex items-center gap-1"
                          title="Buka form pengumpulan tugas"
                        >
                          <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                          Tugas
                        </Link>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() =>
                        handleDeleteEvent(event.id, event.nama_event)
                      }
                      disabled={deletingId === event.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      title="Hapus event"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Edit Data Event
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ID: {editingEvent?.id}
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nama Event *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.nama_event}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      nama_event: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Deskripsi Event
                </label>
                <textarea
                  rows={3}
                  value={editFormData.deskripsi}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      deskripsi: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.tanggal}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        tanggal: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    required
                    value={editFormData.jam_mulai}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        jam_mulai: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Jam Berakhir *
                  </label>
                  <input
                    type="time"
                    required
                    value={editFormData.jam_berakhir}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        jam_berakhir: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Lokasi *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.lokasi}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        lokasi: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Kuota Kapasitas
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Contoh: 100"
                    value={editFormData.kapasitas}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        kapasitas: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    checked={editFormData.isPaidEvent}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        isPaidEvent: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    Event Berbayar (Wajib Upload Bukti Pembayaran)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    checked={editFormData.adaTugas}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        adaTugas: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    Ada Tugas Pasca-Acara (Syarat Pengambilan Sertifikat)
                  </span>
                </label>
              </div>

              {/* Tugas Fields if enabled */}
              {editFormData.adaTugas && (
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">
                      Judul Tugas
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Resume Materi Workshop"
                      value={editFormData.judulTugas}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          judulTugas: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-white rounded-lg border border-amber-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">
                      Deadline Tugas
                    </label>
                    <input
                      type="date"
                      value={editFormData.deadlineTugas}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          deadlineTugas: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-white rounded-lg border border-amber-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
