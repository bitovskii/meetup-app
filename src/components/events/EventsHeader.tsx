'use client';

import { useState } from 'react';
import CreateEventModal from './CreateEventModal';

interface EventsHeaderProps {
  onEventCreated?: () => void;
}

export default function EventsHeader({ onEventCreated }: Readonly<EventsHeaderProps>) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleEventCreated = () => {
    if (onEventCreated) {
      onEventCreated();
    }
  };

  return (
    <>
      {/* Remove the header completely, just keep the modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleEventCreated}
      />
    </>
  );
}