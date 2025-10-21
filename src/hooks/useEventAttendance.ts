import { useState, useEffect } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  // Check user's attendance status when component loads
  useEffect(() => {
    if (!user?.sessionToken || isInitialized) return;

    const checkAttendance = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/events/${eventId}/attendance`, {
          headers: {
            'Authorization': `Bearer ${user.sessionToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setIsAttending(result.data.isAttending);
            setAttendeeCount(result.data.attendeeCount);
          }
        }
      } catch (err) {
        console.error('Error checking attendance:', err);
        // Don't show error for initial check, just use defaults
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkAttendance();
  }, [user?.sessionToken, eventId, isInitialized]);

  const joinEvent = async () => {
    if (!user?.sessionToken) {
      setError('Please sign in to join events');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Joining event:', eventId);

      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔄 Join response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔄 Join failed with status:', response.status, errorText);
        throw new Error(`Failed to join event (${response.status})`);
      }

      const result = await response.json();
      console.log('🔄 Join result:', result);

      if (result.success) {
        setIsAttending(true);
        setAttendeeCount(result.data.attendeeCount);
        console.log('✅ Successfully joined event');
      } else {
        throw new Error(result.error || 'Join operation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join event';
      setError(errorMessage);
      console.error('❌ Error joining event:', err);
    } finally {
      setIsLoading(false);
      console.log('🔄 Join operation completed, loading:', false);
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
      
      console.log('🔄 Leaving event:', eventId);

      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔄 Leave response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔄 Leave failed with status:', response.status, errorText);
        throw new Error(`Failed to leave event (${response.status})`);
      }

      const result = await response.json();
      console.log('🔄 Leave result:', result);

      if (result.success) {
        setIsAttending(false);
        setAttendeeCount(result.data.attendeeCount);
        console.log('✅ Successfully left event');
      } else {
        throw new Error(result.error || 'Leave operation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave event';
      setError(errorMessage);
      console.error('❌ Error leaving event:', err);
    } finally {
      setIsLoading(false);
      console.log('🔄 Leave operation completed, loading:', false);
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