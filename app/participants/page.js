"use client"
import { useState, useEffect } from 'react';
import { 
    MagnifyingGlassIcon, 
    ArrowDownTrayIcon, 
    CheckIcon,
    UsersIcon,
    FunnelIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState([]);
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [eventFilter, setEventFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterParticipants();
    }, [search, statusFilter, eventFilter, participants]);

    async function fetchData() {
        try {
            setLoading(true);
            
            // Fetch participants
            const participantsRes = await fetch('/api/participants');
            if (!participantsRes.ok) {
                throw new Error(`Participants API error: ${participantsRes.status}`);
            }
            const participantsData = await participantsRes.json();
            if (!Array.isArray(participantsData)) {
                throw new Error('Participants data is not an array');
            }
            
            // Fetch events
            const eventsRes = await fetch('/api/events');
            if (!eventsRes.ok) {
                throw new Error(`Events API error: ${eventsRes.status}`);
            }
            const eventsData = await eventsRes.json();
            if (!Array.isArray(eventsData)) {
                throw new Error('Events data is not an array');
            }
            
            setParticipants(participantsData);
            setFilteredParticipants(participantsData);
            setEvents(eventsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setParticipants([]);
            setFilteredParticipants([]);
            setEvents([]);
            setLoading(false);
        }
    }

    function filterParticipants() {
        let filtered = participants;

        // Filter by search
        if (search) {
            filtered = filtered.filter(p => 
                p.nama.toLowerCase().includes(search.toLowerCase()) ||
                p.email.toLowerCase().includes(search.toLowerCase()) ||
                p.nim.includes(search) ||
                p.jurusan.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        // Filter by event
        if (eventFilter !== 'all') {
            filtered = filtered.filter(p => p.eventId === parseInt(eventFilter));
        }

        setFilteredParticipants(filtered);
    }

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'attended':
            case 'hadir':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'registered':
            case 'terdaftar':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'cancelled':
            case 'batal':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const stats = {
        total: participants.length,
        attended: participants.filter(p => p.status === 'hadir' || p.status === 'ATTENDED' || p.status === 'attended').length,
        registered: participants.filter(p => p.status === 'terdaftar' || p.status === 'REGISTERED' || p.status === 'registered').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading participants...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Manajemen Peserta
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Kelola dan pantau semua peserta event
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Peserta</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <UsersIcon className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Hadir</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.attended}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckIcon className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Terdaftar</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.registered}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <CalendarIcon className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama, email, NIM, jurusan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                                <option value="all">Semua Status</option>
                                <option value="terdaftar">Terdaftar</option>
                                <option value="hadir">Hadir</option>
                                <option value="batal">Batal</option>
                            </select>
                        </div>

                        {/* Event Filter */}
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                value={eventFilter}
                                onChange={(e) => setEventFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                                <option value="all">Semua Event</option>
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>
                                        {event.nama_event}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                        <span>
                            Menampilkan <strong>{filteredParticipants.length}</strong> dari <strong>{participants.length}</strong> peserta
                        </span>
                    </div>
                </div>

                {/* Participants Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Peserta
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NIM
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Event
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Jurusan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kontak
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredParticipants.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-500">Tidak ada peserta ditemukan</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredParticipants.map((participant) => (
                                        <tr key={participant.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                                        {participant.nama.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {participant.nama}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {participant.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {participant.nim}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {participant.event?.nama_event || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{participant.jurusan}</div>
                                                <div className="text-sm text-gray-500">Angkatan {participant.angkatan}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(participant.status)}`}>
                                                    {participant.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {participant.no_wa}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
