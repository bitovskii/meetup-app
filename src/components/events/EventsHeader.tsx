'use client';

import { useState } from 'react';
import { formatCount } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import CreateEventModal from './CreateEventModal';

interface EventsHeaderProps {
  eventCount: number;
  onEventCreated?: () => void;
}

export default function EventsHeader({ eventCount, onEventCreated }: Readonly<EventsHeaderProps>) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleEventCreated = () => {
    if (onEventCreated) {
      onEventCreated();
    }
  };

  return (
    <>
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Events
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover {formatCount(eventCount, 'upcoming event')} in your area
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </button>
          )}
        </div>
      </header>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleEventCreated}
      />
    </>
  );
}