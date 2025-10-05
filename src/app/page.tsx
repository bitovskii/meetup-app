'use client';

import { useState, useEffect } from 'react';
import EventCard from "@/components/EventCard";
import GroupsSection from "@/components/GroupsSection";
import Navigation from "@/components/Navigation";
import { useEvents } from "@/hooks/useSupabase";

export default function Home() {
  const [activeSection, setActiveSection] = useState<'events' | 'groups'>('events');
  const [authError, setAuthError] = useState<string | null>(null);
  const { events, loading: eventsLoading, error: eventsError } = useEvents();

  // Check for auth errors in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      switch (error) {
        case 'auth_failed':
          setAuthError('Authentication failed. Please try again.');
          break;
        case 'no_session':
          setAuthError('Session not found. Please sign in again.');
          break;
        default:
          setAuthError('An error occurred during authentication.');
      }
      
      // Clear error from URL after 5 seconds
      setTimeout(() => {
        setAuthError(null);
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 5000);
    }
  }, []);

  const renderEventsSection = () => {
    if (eventsLoading) {
      return (
        <div className="min-h-screen pt-24 p-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Discover Events
            </h1>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading events...</span>
            </div>
          </div>
        </div>
      );
    }

    if (eventsError) {
      return (
        <div className="min-h-screen pt-24 p-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Discover Events
            </h1>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-500 mb-2">⚠️ Error loading events</div>
                <p className="text-gray-600 dark:text-gray-400">{eventsError}</p>
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
            Discover Events
          </h1>
          
          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No events found. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  image={event.image}
                  title={event.title}
                  date={event.date}
                  time={event.time}
                  place={event.place}
                  description={event.description}
                  members={event.members}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      {/* Auth Error Display */}
      {authError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 rounded-lg px-4 py-3 shadow-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 dark:text-red-400 text-sm">{authError}</span>
            <button 
              onClick={() => setAuthError(null)}
              className="ml-3 text-red-500 hover:text-red-700 dark:hover:text-red-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {activeSection === 'events' ? renderEventsSection() : <GroupsSection />}
    </div>
  );
}
