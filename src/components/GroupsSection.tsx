import Image from 'next/image';
import { useGroups } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';

interface GroupCardProps {
  readonly image: string;
  readonly name: string;
  readonly members: number;
  readonly description: string;
  readonly category: string;
  readonly location: string;
}

function GroupCard({ image, name, members, description, category, location }: GroupCardProps) {
  const { user } = useAuth();
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-xs w-full cursor-pointer transform transition-transform duration-200 hover:scale-[1.02] hover:-translate-y-1 relative will-change-transform">
      {/* Simplified glow effect */}
      <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 rounded-lg transition-colors duration-300"></div>
      
      {/* Group Image */}
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105 will-change-transform"
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>
      
      {/* Card Content */}
      <div className="p-3 relative z-10">
        {/* Group Name */}
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
          {name}
        </h2>
        
        {/* Category */}
        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1.5 group-hover:text-pink-500 transition-colors duration-200">
          <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="text-xs">{category}</span>
        </div>
        
        {/* Location */}
        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1.5 group-hover:text-blue-500 transition-colors duration-200">
          <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs">{location}</span>
        </div>
        
        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 text-xs mb-2 line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors duration-200">
          {description}
        </p>
        
        {/* Members Count and Join Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600 dark:text-gray-300 group-hover:text-green-500 transition-colors duration-200">
            <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs">{members}</span>
          </div>
          
          {/* Join Button */}
          {user ? (
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors duration-200 hover:scale-105 transform will-change-transform">
              Join
            </button>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // This will trigger parent component to show auth modal
              }}
              className="bg-gray-400 hover:bg-purple-600 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors duration-200 hover:scale-105 transform will-change-transform"
              title="Sign in to join"
            >
              Sign in to join
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GroupsSection() {
  const { groups, loading, error } = useGroups();

  if (loading) {
    return (
      <div className="min-h-screen pt-24 p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Discover Groups
          </h1>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading groups...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Discover Groups
          </h1>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️ Error loading groups</div>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Discover Groups
        </h1>
        
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No groups found. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                image={group.image}
                name={group.name}
                members={group.members}
                description={group.description}
                category={group.category}
                location={group.location}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}