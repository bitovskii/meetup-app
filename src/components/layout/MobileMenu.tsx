import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import CreateEventModal from '../events/CreateEventModal';
import { useEvents } from '@/hooks';

interface MobileMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onOpenAuthModal: () => void;
}

export default function MobileMenu({ isMenuOpen, setIsMenuOpen, onOpenAuthModal }: Readonly<MobileMenuProps>) {
  const { user, isAuthenticated, signOut } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { refetch } = useEvents();

  const handleSignOut = () => {
    signOut();
    setIsMenuOpen(false);
  };

  const handleCreateEventClick = () => {
    setIsCreateModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleEventCreated = () => {
    refetch();
  };

  if (!isMenuOpen) return null;

  return (
    <>
      <div className="md:hidden border-t border-gray-200 dark:border-gray-700" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1" role="menu" aria-orientation="vertical">
          {/* Mobile authentication section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="flex items-center px-3 py-2">
                  {user.photoUrl ? (
                    <Image 
                      src={user.photoUrl} 
                      alt="Profile" 
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-medium">
                        {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                      via {user.provider}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCreateEventClick}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-300 rounded-md"
                >
                  Create Event
                </button>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-md"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  onOpenAuthModal();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleEventCreated}
      />
    </>
  );
}