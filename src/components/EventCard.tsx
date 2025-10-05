import Image from 'next/image';

interface EventCardProps {
  readonly image: string;
  readonly title: string;
  readonly date: string;
  readonly time: string;
  readonly place: string;
  readonly description: string;
  readonly members: number;
}

export default function EventCard({
  image,
  title,
  date,
  time,
  place,
  description,
  members
}: EventCardProps) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-xs w-full cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-2 relative">
      {/* Magical glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/5 group-hover:to-pink-500/10 rounded-lg transition-all duration-500"></div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
      
      {/* Event Image */}
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Image overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Card Content */}
      <div className="p-3 relative z-10">
        {/* Title */}
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {title}
        </h2>
        
        {/* Date and Time */}
        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1.5 group-hover:text-blue-500 transition-colors duration-300">
          <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">{date} • {time}</span>
        </div>
        
        {/* Location */}
        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1.5 group-hover:text-purple-500 transition-colors duration-300">
          <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs">{place}</span>
        </div>
        
        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 text-xs mb-2 line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors duration-300">
          {description}
        </p>
        
        {/* Members Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600 dark:text-gray-300 group-hover:text-pink-500 transition-colors duration-300">
            <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs">{members}</span>
          </div>
          
          {/* Join Button */}
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-medium transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-600 group-hover:shadow-lg group-hover:shadow-blue-500/30 group-hover:scale-105">
            Join
          </button>
        </div>
      </div>
    </div>
  );
}