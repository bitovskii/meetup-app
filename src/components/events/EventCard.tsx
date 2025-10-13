import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import type { Event } from '@/types';

interface EventCardProps extends Event {
  onSignInClick?: () => void;
}

export default function EventCard({
  image,
  title,
  date,
  time,
  place,
  description,
  members,
  onSignInClick
}: Readonly<EventCardProps>) {
  const { isAuthenticated } = useAuth();
  return (
    <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200 w-80 flex flex-col focus-within:ring-2 focus-within:ring-blue-500">
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={image}
          alt={`Event image for ${title}`}
          fill
          className="object-cover"
          priority={false}
        />
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {title}
        </h3>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2" aria-label={`Date and time: ${date} at ${time}`}>
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{date} at {time}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3" aria-label={`Location: ${place}`}>
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
          </svg>
          <span>{place}</span>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
          {description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400" aria-label={`${members} people attending`}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{members} attending</span>
          </div>
          
          <button 
            onClick={isAuthenticated ? undefined : onSignInClick}
            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:bg-green-700 border border-green-600 hover:border-green-700 focus:border-green-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
            aria-label={isAuthenticated ? `Join ${title} event` : `Sign in to join ${title} event`}
          >
            {isAuthenticated ? 'Join' : 'Sign in to join'}
          </button>
        </div>
      </div>
    </article>
  );
}
