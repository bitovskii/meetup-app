// Event interface for type safety
export interface Event {
  readonly image: string;
  readonly title: string;
  readonly date: string;
  readonly time: string;
  readonly place: string;
  readonly description: string;
  readonly members: number;
}

// Group interface for type safety
export interface Group {
  readonly image: string;
  readonly name: string;
  readonly members: number;
  readonly description: string;
  readonly category: string;
  readonly location: string;
}

// Navigation section type
export type NavigationSection = 'events' | 'groups';

// Common props for navigation
export interface NavigationProps {
  readonly activeSection: NavigationSection;
  readonly onSectionChange: (section: NavigationSection) => void;
}