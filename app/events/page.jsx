'use client';

import { useEffect, useState } from 'react';
import EventsIndex from './Index';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();

        const mapped = Array.isArray(data)
          ? data.map((event) => ({
              id: event.id,
              title: event.nama_event,
              description: event.deskripsi,
              date: event.tanggal,
              time: event.jam,
              location: event.lokasi,
              quota: event.kapasitas,
              status: event.status || 'PUBLISHED',
              poster: event.poster || null,
              _count: {
                participants: event.participants?.length || 0,
              },
            }))
          : [];

        setEvents(mapped);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF0] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <EventsIndex
      auth={{ user: null }}
      events={events}
      filters={{}}
    />
  );
}
