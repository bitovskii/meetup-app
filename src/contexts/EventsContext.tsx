'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Event } from '@/types';

interface EventsContextType {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/events');
      
      if (!response.ok) {
        let errorMessage = 'Failed to load events';
        
        if (response.status === 500) {
          errorMessage = 'Server error. Please refresh the page or try again later';
        } else if (response.status === 404) {
          errorMessage = 'Events service not available';
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // API now returns properly formatted events, no transformation needed
        setEvents(result.data);
      } else {
        setEvents([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      console.error('Error loading events:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const value = useMemo(() => ({
    events,
    isLoading,
    error,
    refetch: fetchEvents
  }), [events, isLoading, error, fetchEvents]);

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEventsContext() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEventsContext must be used within an EventsProvider');
  }
  return context;
}