import { useState, useEffect } from 'react';
import type { Event } from '@/types';
import { MOCK_EVENTS } from '@/data/events';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call delay
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setEvents(MOCK_EVENTS);
      } catch (err) {
        setError('Failed to load events');
        console.error('Error loading events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  return {
    events,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setEvents(MOCK_EVENTS);
      setIsLoading(false);
    }
  };
}