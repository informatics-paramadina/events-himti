"use client";

import EventsIndex from "./events/Index";
import { dummyEvents } from "./data/dummyEvents";

// Transform dummy events to match the expected data structure
const eventsWithParticipants = dummyEvents.map(event => ({
  ...event,
  _count: {
    participants: event.registered || 0,
  },
}));

export default function Home() {
  return (
    <EventsIndex 
      auth={{ user: null }}
      events={eventsWithParticipants}
      filters={{}}
    />
  );
}