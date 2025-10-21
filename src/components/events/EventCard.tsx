import { useAuth } from '@/contexts/AuthContext';
import { useEventAttendance } from '@/hooks/useEventAttendance';
import { formatDateToDDMMYYYY, formatTimeTo24Hour } from '@/lib/utils';
import type { Event } from '@/types';

interface EventCardProps extends Event {
  onSignInClick?: () => void;
  isUserAttending?: boolean;
}

export default function EventCard({
  id,
  image,
  title,
  date,
  time,
  place,
  description,
  members,
  onSignInClick,
  isUserAttending = false
}: Readonly<EventCardProps>) {
  const { isAuthenticated } = useAuth();
  
  const {
    isAttending,
    attendeeCount,
    isLoading,
    error,
    joinEvent,
    leaveEvent,
    clearError
  } = useEventAttendance({
    eventId: id || '',
    initialIsAttending: isUserAttending,
    initialAttendeeCount: members
  });
  
  // Format date and time for display
  const formattedDate = formatDateToDDMMYYYY(date);
  const formattedTime = formatTimeTo24Hour(time);

  const handleButtonClick = async () => {
    if (!isAuthenticated) {
      onSignInClick?.();
      return;
    }

    if (error) {
      clearError();
    }

    if (isAttending) {
      await leaveEvent();
    } else {
      await joinEvent();
    }
  };

  const getButtonText = () => {
    if (!isAuthenticated) return 'Sign in to join';
    if (isLoading) return isAttending ? 'Leaving...' : 'Joining...';
    return isAttending ? 'Leave' : 'Join';
  };

  const getButtonStyles = () => {
    if (!isAuthenticated) {
      return 'text-white bg-green-600 hover:bg-green-700 focus:bg-green-700 border-green-600 hover:border-green-700 focus:border-green-700';
    }
    
    if (isAttending) {
      return 'text-red-600 bg-white hover:bg-red-50 focus:bg-red-50 border-red-600 hover:border-red-700 focus:border-red-700';
    }
    
    return 'text-white bg-green-600 hover:bg-green-700 focus:bg-green-700 border-green-600 hover:border-green-700 focus:border-green-700';
  };
  
  return (
    <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200 w-80 flex flex-col focus-within:ring-2 focus-within:ring-blue-500 relative">
      <div className="relative w-full aspect-video overflow-hidden">
        {/* Use regular img tag for Supabase storage images to avoid Vercel optimization issues */}
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full"
          loading="lazy"
        />
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {title}
        </h3>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2" aria-label={`Date and time: ${formattedDate} at ${formattedTime}`}>
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formattedDate} at {formattedTime}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3" aria-label={`Location: ${place}`}>
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{place}</span>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
          {description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400" aria-label={`${attendeeCount} people attending`}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{attendeeCount} attending</span>
          </div>
          
          <button 
            onClick={handleButtonClick}
            disabled={isLoading}
            className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyles()} ${isAttending ? 'focus:ring-red-500' : 'focus:ring-green-500'}`}
            aria-label={isAuthenticated ? `${isAttending ? 'Leave' : 'Join'} ${title} event` : `Sign in to join ${title} event`}
          >
            {getButtonText()}
          </button>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-700 text-xs rounded-md">
            {error}
          </div>
        )}
      </div>
    </article>
  );
}
