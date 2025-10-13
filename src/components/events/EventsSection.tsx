import { useEvents } from '@/hooks';
import EventsHeader from './EventsHeader';
import EventsGrid from './EventsGrid';
import Loading from '../ui/Loading';

export default function EventsSection() {
  const { events, isLoading, error } = useEvents();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Error Loading Events
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900" id="events-panel" role="tabpanel" aria-labelledby="events-tab">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EventsHeader eventCount={events.length} />
        <EventsGrid events={events} />
      </div>
    </main>
  );
}