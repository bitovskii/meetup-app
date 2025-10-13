import Link from 'next/link';

export default function Logo() {
  return (
    <div className="flex items-center space-x-3">
      <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.27L5.82 21L7 14L2 9L8.91 8.26L12 2Z" opacity="0.8"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <circle cx="8" cy="8" r="1.5" fill="currentColor" opacity="0.6"/>
        <circle cx="16" cy="8" r="1.5" fill="currentColor" opacity="0.6"/>
        <circle cx="8" cy="16" r="1.5" fill="currentColor" opacity="0.6"/>
        <circle cx="16" cy="16" r="1.5" fill="currentColor" opacity="0.6"/>
      </svg>
      <Link 
        href="/" 
        className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
      >
        Meetup
      </Link>
    </div>
  );
}