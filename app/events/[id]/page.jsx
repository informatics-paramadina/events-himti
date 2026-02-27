'use client';

import { useParams } from 'next/navigation';
import Show from "../Show";
import { useState, useEffect } from 'react';

export default function ShowEventPage() {
  const params = useParams();
  const eventId = parseInt(params.id);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch('/api/events');
        const events = await res.json();
        const foundEvent = events.find(e => e.id === eventId);
        setEvent(foundEvent || null);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <p className="text-gray-600 mt-2">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Count participants for this event
  const participantCount = event.participants?.length || 0;
  const remainingQuota = (event.kapasitas || 0) - participantCount;
  const canRegister = remainingQuota > 0;

  const eventWithCount = {
    ...event,
    _count: {
      participants: participantCount,
    },
  };

  return (
    <Show
      auth={{ user: null }}
      event={eventWithCount}
      remainingQuota={remainingQuota}
      canRegister={canRegister}
      eventId={eventId}
    />
  );
}
