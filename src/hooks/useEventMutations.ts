import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Event, CreateEventData, UpdateEventData } from '@/types';

export function useEventMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createEvent = async (eventData: CreateEventData | FormData): Promise<Event | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Determine if we're sending FormData or JSON
      const isFormData = eventData instanceof FormData;
      
      // Prepare headers with authentication
      const headers: Record<string, string> = {};
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      
      // Add authorization header if user has session token
      if (user?.sessionToken) {
        headers['Authorization'] = `Bearer ${user.sessionToken}`;
      }
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers,
        body: isFormData ? eventData : JSON.stringify(eventData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Customize error messages based on status code
        let errorMessage = result.error || 'Failed to create event';
        
        if (response.status === 401) {
          errorMessage = 'Please sign in to create events';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to create events';
        } else if (response.status === 400) {
          errorMessage = result.error || 'Please check your event details and try again';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later';
        }
        
        throw new Error(errorMessage);
      }
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
      console.error('Error creating event:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvent = async (eventData: UpdateEventData): Promise<Event | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/events/${eventData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Customize error messages based on status code
        let errorMessage = result.error || 'Failed to update event';
        
        if (response.status === 401) {
          errorMessage = 'Please sign in to update events';
        } else if (response.status === 403) {
          errorMessage = 'You can only edit events you created';
        } else if (response.status === 404) {
          errorMessage = 'Event not found';
        } else if (response.status === 400) {
          errorMessage = result.error || 'Please check your event details and try again';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later';
        }
        
        throw new Error(errorMessage);
      }
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      setError(errorMessage);
      console.error('Error updating event:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Customize error messages based on status code
        let errorMessage = result.error || 'Failed to delete event';
        
        if (response.status === 401) {
          errorMessage = 'Please sign in to delete events';
        } else if (response.status === 403) {
          errorMessage = 'You can only delete events you created';
        } else if (response.status === 404) {
          errorMessage = 'Event not found or already deleted';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later';
        }
        
        throw new Error(errorMessage);
      }
      
      return result.success || false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
      setError(errorMessage);
      console.error('Error deleting event:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}