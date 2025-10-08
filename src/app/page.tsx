'use client';

import { useState } from 'react';
import EventCard from '@/components/EventCard';
import GroupsSection from '@/components/GroupsSection';
import Navigation from '@/components/Navigation';
import type { Event, NavigationSection } from '@/types';

export default function Home() {
  const [activeSection, setActiveSection] = useState<NavigationSection>('events');

  const events: Event[] = [
    {
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop&auto=format",
      title: "React Developers Meetup",
      date: "October 15, 2025",
      time: "6:00 PM",
      place: "Tech Hub, Downtown",
      description: "Join us for an exciting evening of React discussions, networking, and hands-on coding sessions. We'll explore the latest React features, best practices, and share experiences from real-world projects.",
      members: 42
    },
    {
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=225&fit=crop&auto=format",
      title: "AI & Machine Learning Workshop",
      date: "October 18, 2025",
      time: "2:00 PM",
      place: "Innovation Center",
      description: "Dive deep into artificial intelligence and machine learning concepts. Perfect for beginners and intermediate developers looking to expand their skillset.",
      members: 67
    },
    {
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop&auto=format",
      title: "Startup Pitch Night",
      date: "October 22, 2025",
      time: "7:30 PM",
      place: "Business District Hall",
      description: "Watch promising startups pitch their ideas to investors and entrepreneurs. Network with like-minded individuals and discover the next big thing.",
      members: 128
    },
    {
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=225&fit=crop&auto=format",
      title: "Photography Walk",
      date: "October 25, 2025",
      time: "10:00 AM",
      place: "Central Park",
      description: "Capture the beauty of autumn with fellow photography enthusiasts. All skill levels welcome. Bring your camera and explore new techniques.",
      members: 34
    },
    {
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=225&fit=crop&auto=format",
      title: "Book Club Discussion",
      date: "November 2, 2025",
      time: "6:30 PM",
      place: "Community Library",
      description: "Monthly book club meeting discussing 'The Future of Work'. Join our passionate readers for insightful discussions and coffee.",
      members: 23
    },
    {
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=225&fit=crop&auto=format",
      title: "Cooking Class: Italian Cuisine",
      date: "November 5, 2025",
      time: "4:00 PM",
      place: "Culinary Studio",
      description: "Learn to make authentic Italian pasta and sauces from a professional chef. All ingredients provided. Perfect for food lovers!",
      members: 18
    },
    {
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=225&fit=crop&auto=format",
      title: "Cybersecurity Conference",
      date: "November 8, 2025",
      time: "9:00 AM",
      place: "Convention Center",
      description: "Stay ahead of cyber threats with expert talks on the latest security trends, tools, and best practices. Essential for IT professionals.",
      members: 245
    },
    {
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop&auto=format",
      title: "Yoga & Mindfulness Session",
      date: "November 12, 2025",
      time: "8:00 AM",
      place: "Wellness Studio",
      description: "Start your day with peaceful yoga and mindfulness meditation. Suitable for all levels. Bring your own mat or rent one at the venue.",
      members: 31
    },
    {
      image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=225&fit=crop&auto=format",
      title: "Board Game Tournament",
      date: "November 15, 2025",
      time: "1:00 PM",
      place: "Game Café",
      description: "Compete in friendly board game tournaments featuring classic and modern games. Prizes for winners and fun for everyone!",
      members: 56
    },
    {
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=225&fit=crop&auto=format",
      title: "Climate Action Workshop",
      date: "November 20, 2025",
      time: "3:00 PM",
      place: "Environmental Center",
      description: "Learn practical ways to reduce your carbon footprint and make a positive environmental impact. Interactive sessions with local activists.",
      members: 89
    }
  ];

  const renderEventsSection = () => (
    <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900" id="events-panel" role="tabpanel" aria-labelledby="events-tab">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* GitHub-style page header */}
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover upcoming events in your area
          </p>
        </header>
        
        <section aria-label="Events list">
          <div className="flex flex-wrap gap-6 justify-center">
            {events.map((event) => (
              <EventCard
                key={`${event.title}-${event.date}`}
                {...event}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );

  return (
    <>
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      {activeSection === 'events' ? renderEventsSection() : <GroupsSection />}
    </>
  );
}
