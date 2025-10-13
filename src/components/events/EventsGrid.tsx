import type { Event } from '@/types';
import EventCard from './EventCard';
import { generateKey } from '@/lib/utils';

interface EventsGridProps {
  events: Event[];
  onSignInClick?: () => void;
}

export default function EventsGrid({ events, onSignInClick }: Readonly<EventsGridProps>) {
  return (
    <section aria-label="Events list">
      <div className="flex flex-wrap gap-6 justify-center">
        {events.map((event) => (
          <EventCard
            key={generateKey(event.title, event.date)}
            {...event}
            onSignInClick={onSignInClick}
          />
        ))}
      </div>
    </section>
  );
}