"use client"
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
    CalendarIcon, 
    UsersIcon, 
    CheckCircleIcon,
    PlusIcon,
    ClockIcon,
    MapPinIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalParticipants: 0,
        activeEvents: 0,
        upcomingEvents: 0,
    });
    const [events, setEvents] = useState([]);
    const [recentParticipants, setRecentParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        try {
            setLoading(true);
            
            // Fetch events
            const eventsRes = await fetch('/api/events');
            if (!eventsRes.ok) {
                throw new Error(`Events API error: ${eventsRes.status}`);
            }
            const eventsData = await eventsRes.json();
            if (!Array.isArray(eventsData)) {
                throw new Error('Events data is not an array');
            }
            
            // Fetch participants
            const participantsRes = await fetch('/api/participants');
            if (!participantsRes.ok) {
                throw new Error(`Participants API error: ${participantsRes.status}`);
            }
            const participantsData = await participantsRes.json();
            if (!Array.isArray(participantsData)) {
                throw new Error('Participants data is not an array');
            }
            
            // Calculate stats
            const now = new Date();
            const activeEvents = eventsData.filter(event => {
                const eventDate = new Date(event.tanggal);
                // Event is active if it's today or within next 30 days
                const diffTime = eventDate - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 30;
            });

            const upcomingEvents = eventsData.filter(event => {
                const eventDate = new Date(event.tanggal);
                return eventDate >= now;
            });

            setStats({
                totalEvents: eventsData.length,
                totalParticipants: participantsData.length,
                activeEvents: activeEvents.length,
                upcomingEvents: upcomingEvents.length,
            });

            // Sort events by date (upcoming first)
            const sortedEvents = eventsData
                .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
                .slice(0, 5);

            // Add participant count to each event
            const eventsWithCount = sortedEvents.map(event => ({
                ...event,
                participantCount: participantsData.filter(p => p.eventId === event.id).length
            }));

            setEvents(eventsWithCount);
            
            // Get recent 5 participants
            setRecentParticipants(participantsData.slice(0, 5));
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Set empty data but don't show error to user, just log it
            setStats({
                totalEvents: 0,
                totalParticipants: 0,
                activeEvents: 0,
                upcomingEvents: 0,
            });
            setEvents([]);
            setRecentParticipants([]);
            setLoading(false);
        }
    }

    async function updateParticipantStatus(participantId, newStatus) {
        try {
            setUpdatingId(participantId);
            const response = await fetch(`/api/participants/${participantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Gagal mengupdate status');
            }

            // Update UI
            setRecentParticipants(prev => prev.map(p => 
                p.id === participantId ? { ...p, status: newStatus } : p
            ));
        } catch (error) {
            console.error('Error updating participant:', error);
            alert('Gagal mengupdate status peserta: ' + error.message);
        } finally {
            setUpdatingId(null);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>Dashboard - Event HIMTI</title>
            </Head>

            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Dashboard Event HIMTI
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Selamat datang! Kelola event dan peserta Anda di sini.
                            </p>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                            <Link
                                href="/events"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                            >
                                <CalendarIcon className="h-5 w-5 mr-2" />
                                Lihat Semua Event
                            </Link>
                            <Link
                                href="/events/create"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Buat Event Baru
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Events</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEvents}</p>
                                <p className="text-xs text-gray-500 mt-1">Semua event</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <CalendarIcon className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Peserta</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalParticipants}</p>
                                <p className="text-xs text-gray-500 mt-1">Pendaftar terdaftar</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <UsersIcon className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Event Aktif</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeEvents}</p>
                                <p className="text-xs text-gray-500 mt-1">30 hari mendatang</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <CheckCircleIcon className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingEvents}</p>
                                <p className="text-xs text-gray-500 mt-1">Event mendatang</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <ArrowTrendingUpIcon className="h-8 w-8 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Events List - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Event Mendatang</h3>
                                    <p className="text-sm text-gray-500 mt-1">Daftar event yang akan datang</p>
                                </div>
                                <Link
                                    href="/events"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Lihat Semua →
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {events.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">Belum ada event</p>
                                        <Link
                                            href="/events/create"
                                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            <PlusIcon className="h-5 w-5 mr-2" />
                                            Buat Event Pertama
                                        </Link>
                                    </div>
                                ) : (
                                    events.map((event) => {
                                        const eventDate = new Date(event.tanggal);
                                        const isUpcoming = eventDate >= new Date();
                                        const percentage = event.kapasitas 
                                            ? Math.round((event.participantCount / event.kapasitas) * 100) 
                                            : 0;
                                        
                                        return (
                                            <div key={event.id} className="p-6 hover:bg-gray-50 transition">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center">
                                                            <Link 
                                                                href={`/events/${event.id}`}
                                                                className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                                                            >
                                                                {event.nama_event}
                                                            </Link>
                                                            {isUpcoming && (
                                                                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                                    Upcoming
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {event.deskripsi && (
                                                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                                                {event.deskripsi}
                                                            </p>
                                                        )}
                                                        
                                                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                                                            <div className="flex items-center">
                                                                <CalendarIcon className="h-4 w-4 mr-1.5" />
                                                                {eventDate.toLocaleDateString('id-ID', { 
                                                                    day: 'numeric', 
                                                                    month: 'long', 
                                                                    year: 'numeric' 
                                                                })}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <ClockIcon className="h-4 w-4 mr-1.5" />
                                                                {event.jam}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <MapPinIcon className="h-4 w-4 mr-1.5" />
                                                                {event.lokasi}
                                                            </div>
                                                        </div>

                                                        {event.kapasitas && (
                                                            <div className="mt-3">
                                                                <div className="flex items-center justify-between text-sm mb-1">
                                                                    <span className="text-gray-600 flex items-center">
                                                                        <UserGroupIcon className="h-4 w-4 mr-1" />
                                                                        Kapasitas
                                                                    </span>
                                                                    <span className="font-medium text-gray-900">
                                                                        {event.participantCount} / {event.kapasitas}
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                    <div 
                                                                        className={`h-2 rounded-full transition-all ${
                                                                            percentage >= 90 ? 'bg-red-500' :
                                                                            percentage >= 70 ? 'bg-orange-500' :
                                                                            'bg-green-500'
                                                                        }`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Participants - Takes 1 column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Pendaftaran Terbaru</h3>
                                        <p className="text-sm text-gray-500 mt-1">Peserta yang baru mendaftar</p>
                                    </div>
                                    <Link
                                        href="/participants"
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Lihat Semua →
                                    </Link>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {recentParticipants.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">Belum ada peserta</p>
                                    </div>
                                ) : (
                                    recentParticipants.map((participant) => (
                                        <div key={participant.id} className="p-4 hover:bg-gray-50 transition">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                                        {participant.nama.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0 mx-3">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {participant.nama}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {participant.event?.nama_event || 'Event tidak ditemukan'}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">
                                                            {participant.jurusan}
                                                        </span>
                                                        <span className="text-xs text-gray-400">•</span>
                                                        <span className="text-xs text-gray-500">
                                                            {participant.angkatan}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                                        participant.status === 'ATTENDED' || participant.status === 'hadir'
                                                            ? 'bg-green-100 text-green-800'
                                                            : participant.status === 'REGISTERED' || participant.status === 'terdaftar'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {participant.status}
                                                    </span>
                                                    {participant.status !== 'hadir' && (
                                                        <button
                                                            onClick={() => updateParticipantStatus(participant.id, 'hadir')}
                                                            disabled={updatingId === participant.id}
                                                            className="ml-2 px-2 py-1 text-xs font-medium rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                            title="Tandai hadir"
                                                        >
                                                            {updatingId === participant.id ? '...' : '✓'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
                            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href="/events/create"
                                    className="block w-full px-4 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition text-center"
                                >
                                    + Buat Event Baru
                                </Link>
                                <Link
                                    href="/events"
                                    className="block w-full px-4 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition text-center"
                                >
                                    📅 Kelola Events
                                </Link>
                                <Link
                                    href="/participants"
                                    className="block w-full px-4 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition text-center"
                                >
                                    👥 Kelola Peserta
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}