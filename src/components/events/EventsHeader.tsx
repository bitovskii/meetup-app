import { formatCount } from '@/lib/utils';

interface EventsHeaderProps {
  eventCount: number;
}

export default function EventsHeader({ eventCount }: Readonly<EventsHeaderProps>) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        Events
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Discover {formatCount(eventCount, 'upcoming event')} in your area
      </p>
    </header>
  );
}