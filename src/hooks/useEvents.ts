import { useState, useEffect, useCallback } from 'react';
import type { Event, DatabaseEvent } from '@/types';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform database event to client event format
  const transformEvent = (dbEvent: DatabaseEvent): Event => ({
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    date: dbEvent.date,
    time: dbEvent.time,
    place: dbEvent.place,
    members: dbEvent.members,
    image: dbEvent.image,
    creator_id: dbEvent.creator_id,
    group_id: dbEvent.group_id,
    created_at: dbEvent.created_at,
    updated_at: dbEvent.updated_at
  });

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
        const transformedEvents = result.data.map(transformEvent);
        setEvents(transformedEvents);
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

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents
  };
}