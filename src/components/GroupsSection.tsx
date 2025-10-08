import Image from 'next/image';
import type { Group } from '@/types';

function GroupCard({ image, name, members, description, category, location }: Readonly<Group>) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200 w-80 flex flex-col">
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {name}
        </h3>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>{category}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
          </svg>
          <span>{location}</span>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
          {description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0z" />
            </svg>
            <span>{members} members</span>
          </div>
          
          <button className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 border border-green-600 hover:border-green-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center">
            Join
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GroupsSection() {
  const groups: Group[] = [
    {
      image: "/api/placeholder/300/200",
      name: "Tech Enthusiasts NYC",
      members: 1245,
      description: "A community for technology lovers to share ideas, network, and learn about the latest trends in software development, AI, and digital innovation.",
      category: "Technology",
      location: "New York, NY"
    },
    {
      image: "/api/placeholder/300/200", 
      name: "Creative Writers Circle",
      members: 567,
      description: "Join fellow writers for workshops, critique sessions, and collaborative storytelling. All genres and skill levels welcome.",
      category: "Arts & Culture",
      location: "San Francisco, CA"
    },
    {
      image: "/api/placeholder/300/200",
      name: "Urban Hikers", 
      members: 892,
      description: "Explore scenic trails and hidden gems in and around the city. Weekend hikes for all fitness levels with optional social gatherings.",
      category: "Outdoors",
      location: "Denver, CO"
    },
    {
      image: "/api/placeholder/300/200",
      name: "Startup Founders Network",
      members: 324, 
      description: "Connect with fellow entrepreneurs, share experiences, and build valuable partnerships in the startup ecosystem.",
      category: "Business",
      location: "Austin, TX"
    },
    {
      image: "/api/placeholder/300/200",
      name: "Photography Club",
      members: 743,
      description: "Weekly photo walks, technique sharing, and portfolio reviews. Capture the beauty of urban and natural landscapes together.", 
      category: "Arts & Culture",
      location: "Portland, OR"
    },
    {
      image: "/api/placeholder/300/200",
      name: "Board Game Society",
      members: 456,
      description: "Gather every Friday night for strategic board games, casual card games, and friendly competition in a welcoming environment.",
      category: "Games & Hobbies", 
      location: "Chicago, IL"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Groups
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and join communities that match your interests
          </p>
        </div>

        <div className="flex flex-wrap gap-6 justify-center">
          {groups.map((group) => (
            <GroupCard key={group.name} {...group} />
          ))}
        </div>
      </div>
    </div>
  );
}
