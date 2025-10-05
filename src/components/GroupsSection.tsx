import Image from 'next/image';

interface GroupCardProps {
  readonly image: string;
  readonly name: string;
  readonly members: number;
  readonly description: string;
  readonly category: string;
  readonly location: string;
}

function GroupCard({ image, name, members, description, category, location }: GroupCardProps) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-xs w-full cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-2 relative">
      {/* Magical glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:via-pink-500/5 group-hover:to-blue-500/10 rounded-lg transition-all duration-500"></div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
      {/* Group Image */}
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Image overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Card Content */}
      <div className="p-3">
        {/* Group Name */}
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
          {name}
        </h2>
        
        {/* Category */}
        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1.5">
          <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="text-xs">{category}</span>
        </div>
        
        {/* Location */}
        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1.5">
          <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs">{location}</span>
        </div>
        
        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 text-xs mb-2 line-clamp-2">
          {description}
        </p>
        
        {/* Members Count and Join Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs">{members}</span>
          </div>
          
          {/* Join Button */}
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors">
            Join
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GroupsSection() {
  const groups = [
    {
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=225&fit=crop&auto=format",
      name: "Tech Innovators",
      members: 1247,
      description: "A community of technology enthusiasts, developers, and innovators sharing knowledge and building amazing projects together.",
      category: "Technology",
      location: "San Francisco, CA"
    },
    {
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop&auto=format",
      name: "Creative Entrepreneurs",
      members: 892,
      description: "Connect with creative minds who are building businesses around their passions. Share ideas, get feedback, and grow together.",
      category: "Business",
      location: "New York, NY"
    },
    {
      image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=225&fit=crop&auto=format",
      name: "Urban Photography Club",
      members: 567,
      description: "Capture the essence of city life through photography. Weekly photo walks, workshops, and portfolio reviews.",
      category: "Photography",
      location: "Chicago, IL"
    },
    {
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=225&fit=crop&auto=format",
      name: "Book Lovers Society",
      members: 423,
      description: "Monthly book discussions, author meetups, and literary events. From classics to contemporary fiction and beyond.",
      category: "Literature",
      location: "Boston, MA"
    },
    {
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=225&fit=crop&auto=format",
      name: "Foodie Adventures",
      members: 734,
      description: "Explore local restaurants, cooking classes, and food festivals. Share recipes and discover new cuisines together.",
      category: "Food & Drink",
      location: "Los Angeles, CA"
    },
    {
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop&auto=format",
      name: "Mindful Living",
      members: 312,
      description: "Practice mindfulness, meditation, and wellness together. Weekly sessions and wellness workshops for inner peace.",
      category: "Wellness",
      location: "Austin, TX"
    },
    {
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=225&fit=crop&auto=format",
      name: "AI & Future Tech",
      members: 1156,
      description: "Exploring artificial intelligence, machine learning, and emerging technologies. For researchers and enthusiasts.",
      category: "Technology",
      location: "Seattle, WA"
    },
    {
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=225&fit=crop&auto=format",
      name: "Green Living Initiative",
      members: 445,
      description: "Committed to sustainable living and environmental action. Community gardens, clean-up events, and eco-workshops.",
      category: "Environment",
      location: "Portland, OR"
    }
  ];

  return (
    <div className="min-h-screen pt-24 p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Discover Groups
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {groups.map((group) => (
            <GroupCard
              key={`${group.name}-${group.location}`}
              image={group.image}
              name={group.name}
              members={group.members}
              description={group.description}
              category={group.category}
              location={group.location}
            />
          ))}
        </div>
      </div>
    </div>
  );
}