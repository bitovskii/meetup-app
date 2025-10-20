import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseEventAttendanceProps {
  eventId: string;
  initialIsAttending?: boolean;
  initialAttendeeCount?: number;
}

interface UseEventAttendanceReturn {
  isAttending: boolean;
  attendeeCount: number;
  isLoading: boolean;
  error: string | null;
  joinEvent: () => Promise<void>;
  leaveEvent: () => Promise<void>;
  clearError: () => void;
}

export function useEventAttendance({
  eventId,
  initialIsAttending = false,
  initialAttendeeCount = 0
}: UseEventAttendanceProps): UseEventAttendanceReturn {
  const [isAttending, setIsAttending] = useState(initialIsAttending);
  const [attendeeCount, setAttendeeCount] = useState(initialAttendeeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const joinEvent = async () => {
    if (!user?.sessionToken) {
      setError('Please sign in to join events');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join event');
      }

      if (result.success) {
        setIsAttending(true);
        setAttendeeCount(result.data.attendeeCount);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join event';
      setError(errorMessage);
      console.error('Error joining event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const leaveEvent = async () => {
    if (!user?.sessionToken) {
      setError('Please sign in to leave events');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to leave event');
      }

      if (result.success) {
        setIsAttending(false);
        setAttendeeCount(result.data.attendeeCount);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave event';
      setError(errorMessage);
      console.error('Error leaving event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isAttending,
    attendeeCount,
    isLoading,
    error,
    joinEvent,
    leaveEvent,
    clearError
  };
}