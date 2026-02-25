'use client';

import { useParams } from 'next/navigation';
import Show from "../Show";
import { dummyEvents } from "../../data/dummyEvents";

export default function ShowEventPage() {
  const params = useParams();
  const eventId = parseInt(params.id);
  const event = dummyEvents.find(e => e.id === eventId);

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

  const eventWithCount = {
    ...event,
    _count: {
      participants: event.registered || 0,
    },
  };

  const remainingQuota = event.quota - (event.registered || 0);
  const canRegister = remainingQuota > 0 && event.status === "PUBLISHED";

  return (
    <Show
      auth={{ user: null }}
      event={eventWithCount}
      remainingQuota={remainingQuota}
      canRegister={canRegister}
    />
  );
}
