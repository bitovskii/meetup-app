import type { Event } from '@/types';
import EventCard from './EventCard';
import { generateKey } from '@/lib/utils';

interface EventsGridProps {
  events: Event[];
}

export default function EventsGrid({ events }: Readonly<EventsGridProps>) {
  return (
    <section aria-label="Events list">
      <div className="flex flex-wrap gap-6 justify-center">
        {events.map((event) => (
          <EventCard
            key={generateKey(event.title, event.date)}
            {...event}
          />
        ))}
      </div>
    </section>
  );
}