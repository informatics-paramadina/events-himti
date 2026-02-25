"use client"
import Head from 'next/head';
import Link from 'next/link';
import { 
    CalendarIcon, 
    UsersIcon, 
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboardPreview() {
    // Dummy data
    const stats = { totalEvents: 12, totalParticipants: 150, activeEvents: 3 };
    const recentParticipants = [
        { id: 1, name: "Ilham Saputra", status: "ATTENDED", event: { title: "Workshop Next.js" } },
        { id: 2, name: "Rina Ayu", status: "REGISTERED", event: { title: "Bootcamp React" } }
    ];
    const activeEvents = [
        { id: 1, title: "Workshop Next.js", date: "2026-03-01", quota: 50, _count: { participants: 30 } },
        { id: 2, title: "Bootcamp React", date: "2026-03-10", quota: 100, _count: { participants: 45 } }
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Head>
                <title>Admin Dashboard Preview</title>
            </Head>

            <h2 className="text-2xl font-bold mb-6">Admin Dashboard (Preview)</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white shadow-sm rounded-lg p-6 flex items-center">
                    <CalendarIcon className="h-12 w-12 text-blue-500" />
                    <div className="ml-4">
                        <h3 className="text-gray-500 text-sm font-medium">Total Events</h3>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
                    </div>
                </div>
                <div className="bg-white shadow-sm rounded-lg p-6 flex items-center">
                    <UsersIcon className="h-12 w-12 text-green-500" />
                    <div className="ml-4">
                        <h3 className="text-gray-500 text-sm font-medium">Total Participants</h3>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalParticipants}</p>
                    </div>
                </div>
                <div className="bg-white shadow-sm rounded-lg p-6 flex items-center">
                    <CheckCircleIcon className="h-12 w-12 text-purple-500" />
                    <div className="ml-4">
                        <h3 className="text-gray-500 text-sm font-medium">Active Events</h3>
                        <p className="text-3xl font-bold text-gray-900">{stats.activeEvents}</p>
                    </div>
                </div>
            </div>

            {/* Active Events & Recent Participants */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Events */}
                <div className="bg-white shadow-sm rounded-lg">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Active Events</h3>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                            Create Event
                        </button>
                    </div>
                    <div className="p-6">
                        {activeEvents.map((event) => (
                            <div key={event.id} className="block p-4 border border-gray-200 rounded-lg mb-2">
                                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{new Date(event.date).toLocaleDateString()}</p>
                                <div className="flex items-center mt-2">
                                    <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                                    <span className="text-sm text-gray-600">{event._count.participants} / {event.quota}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Participants */}
                <div className="bg-white shadow-sm rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Registrations</h3>
                    </div>
                    <div className="p-6">
                        {recentParticipants.map((participant) => (
                            <div key={participant.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div>
                                    <p className="font-medium text-gray-900">{participant.name}</p>
                                    <p className="text-sm text-gray-500">{participant.event?.title}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    participant.status === 'ATTENDED'
                                        ? 'bg-green-100 text-green-800'
                                        : participant.status === 'REGISTERED'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {participant.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}