import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function ParticipantsIndex({ auth, event, participants, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(`/events/${event.id}/participants`, { search, status: statusFilter }, { preserveState: true });
    };

    const handleFilterChange = (status) => {
        setStatusFilter(status);
        router.get(`/events/${event.id}/participants`, { search, status }, { preserveState: true });
    };

    const handleExport = () => {
        window.location.href = `/events/${event.id}/participants/export`;
    };

    const toggleParticipant = (id) => {
        setSelectedParticipants(prev => 
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedParticipants.length === participants.length) {
            setSelectedParticipants([]);
        } else {
            setSelectedParticipants(participants.map(p => p.id));
        }
    };

    const handleMarkAttendance = () => {
        if (selectedParticipants.length === 0) {
            alert('Please select participants first');
            return;
        }

        router.post(`/events/${event.id}/participants/mark-attendance`, {
            participant_ids: selectedParticipants
        }, {
            onSuccess: () => {
                setSelectedParticipants([]);
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ATTENDED':
                return 'bg-green-100 text-green-800';
            case 'REGISTERED':
                return 'bg-blue-100 text-blue-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">Participants</h2>
                        <p className="text-sm text-gray-600 mt-1">{event.title}</p>
                    </div>
                    <Link
                        href={`/events/${event.id}`}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        ← Back to Event
                    </Link>
                </div>
            }
        >
            <Head title={`Participants - ${event.title}`} />

            <div className="py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
                            <p className="text-xs sm:text-sm text-gray-500 truncate">Total Registered</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{participants.length}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
                            <p className="text-xs sm:text-sm text-gray-500 truncate">Attended</p>
                            <p className="text-xl sm:text-2xl font-bold text-green-600">
                                {participants.filter(p => p.status === 'ATTENDED').length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
                            <p className="text-xs sm:text-sm text-gray-500 truncate">Registered</p>
                            <p className="text-xl sm:text-2xl font-bold text-blue-600">
                                {participants.filter(p => p.status === 'REGISTERED').length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
                            <p className="text-xs sm:text-sm text-gray-500 truncate">Cancelled</p>
                            <p className="text-xl sm:text-2xl font-bold text-red-600">
                                {participants.filter(p => p.status === 'CANCELLED').length}
                            </p>
                        </div>
                    </div>

                    {/* Actions and Filters */}
                    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 mb-6">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="w-full">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search by name, NIM, email..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                            </form>

                            {/* Filter Buttons */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleFilterChange('')}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm ${
                                        statusFilter === '' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => handleFilterChange('REGISTERED')}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm ${
                                        statusFilter === 'REGISTERED' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Registered
                                </button>
                                <button
                                    onClick={() => handleFilterChange('ATTENDED')}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm ${
                                        statusFilter === 'ATTENDED' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Attended
                                </button>

                                {/* Export Button */}
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-1 sm:gap-2 bg-green-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 transition text-sm"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">Export CSV</span>
                                    <span className="sm:hidden">Export</span>
                                </button>
                            </div>

                            {/* Bulk Actions */}
                            {selectedParticipants.length > 0 && (
                                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <span className="text-xs sm:text-sm text-blue-700">
                                        {selectedParticipants.length} participant(s) selected
                                    </span>
                                    <button
                                        onClick={handleMarkAttendance}
                                        className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm font-medium"
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                        <span className="hidden sm:inline">Mark as Attended</span>
                                        <span className="sm:hidden">Mark</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Participants Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedParticipants.length === participants.length && participants.length > 0}
                                                onChange={toggleAll}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                            NIM
                                        </th>
                                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Email
                                        </th>
                                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                            Phone
                                        </th>
                                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Jurusan
                                        </th>
                                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                            Registered At
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {participants && participants.length > 0 ? (
                                        participants.map((participant) => (
                                            <tr key={participant.id} className="hover:bg-gray-50">
                                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedParticipants.includes(participant.id)}
                                                        onChange={() => toggleParticipant(participant.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                    <div className="font-medium text-xs sm:text-sm text-gray-900">{participant.name}</div>
                                                    <div className="text-xs text-gray-500 sm:hidden">{participant.nim}</div>
                                                </td>
                                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                                                    {participant.nim}
                                                </td>
                                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                                                    {participant.email}
                                                </td>
                                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                                                    {participant.phone}
                                                </td>
                                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                                                    {participant.jurusan || '-'}
                                                </td>
                                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${getStatusColor(participant.status)}`}>
                                                        {participant.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(participant.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                                No participants found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
