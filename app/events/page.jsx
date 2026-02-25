'use client';

import EventsIndex from './Index';
import { dummyEvents } from "../data/dummyEvents";

const eventsWithParticipants = dummyEvents.map(event => ({
  ...event,
  _count: {
    participants: event.registered || 0,
  },
}));

export default function EventsPage() {
  return (
    <EventsIndex 
      auth={{ user: null }}
      events={eventsWithParticipants}
      filters={{}}
    />
  );
}
