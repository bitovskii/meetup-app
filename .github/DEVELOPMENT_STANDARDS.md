# React/Next.js Best Practices - Folder Structure Guide

## 📋 Project Architecture Standards

This document defines the established best practices for organizing React/Next.js projects, specifically refined for the Meetup application. Follow these conventions for all future development.

## 🗂️ Core Folder Structure

```
src/
├── app/                    # Next.js App Router (Pages & API)
│   ├── (routes)/          # Route groups for organization
│   ├── api/               # API route handlers
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Route page components
│
├── components/            # React Components (Feature-based)
│   ├── [feature]/         # Feature-specific components
│   │   ├── index.ts       # Clean exports for the feature
│   │   └── *.tsx          # Feature components
│   │
│   ├── layout/            # Layout & Navigation components
│   │   ├── index.ts       # Layout exports
│   │   ├── Navigation.tsx # Main navigation
│   │   ├── Header.tsx     # Page headers
│   │   ├── Footer.tsx     # Footer component
│   │   └── Sidebar.tsx    # Sidebar navigation
│   │
│   ├── ui/                # Reusable UI Components
│   │   ├── index.ts       # UI component exports
│   │   ├── Button.tsx     # Button variants
│   │   ├── Input.tsx      # Form inputs
│   │   ├── Modal.tsx      # Modal dialogs
│   │   ├── Loading.tsx    # Loading states
│   │   └── Card.tsx       # Card layouts
│   │
│   └── shared/            # Shared/Common components
│       ├── index.ts       # Shared exports
│       ├── ErrorBoundary.tsx
│       └── ProtectedRoute.tsx
│
├── contexts/              # React Context Providers
│   ├── index.ts           # Context exports
│   ├── AuthContext.tsx    # Authentication state
│   ├── ThemeContext.tsx   # Theme/UI state
│   └── AppContext.tsx     # Global app state
│
├── hooks/                 # Custom React Hooks
│   ├── index.ts           # Hook exports
│   ├── useAuth.ts         # Authentication hooks
│   ├── useApi.ts          # API interaction hooks
│   ├── useLocalStorage.ts # Storage hooks
│   └── use[Feature].ts    # Feature-specific hooks
│
├── lib/                   # Utility Libraries & Configuration
│   ├── index.ts           # Library exports
│   ├── constants.ts       # App-wide constants
│   ├── utils.ts           # Pure utility functions
│   ├── validation.ts      # Form/data validation
│   ├── api.ts             # API client configuration
│   └── auth.ts            # Authentication utilities
│
├── types/                 # TypeScript Type Definitions
│   ├── index.ts           # Type exports
│   ├── api.ts             # API response types
│   ├── auth.ts            # Authentication types
│   └── [feature].ts       # Feature-specific types
│
├── data/                  # Static Data & Mocks
│   ├── index.ts           # Data exports
│   ├── mock[Feature].ts   # Mock data for development
│   └── constants.ts       # Static data constants
│
└── styles/                # Styling (if not using CSS-in-JS)
    ├── globals.css        # Global styles
    ├── components.css     # Component-specific styles
    └── variables.css      # CSS custom properties
```

## 🎯 Naming Conventions

### Files & Folders
- **Components**: PascalCase (`UserProfile.tsx`, `EventCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useAuth.ts`, `useEvents.ts`)
- **Utilities**: camelCase (`formatDate.ts`, `apiClient.ts`)
- **Types**: camelCase (`userTypes.ts`, `apiTypes.ts`)
- **Constants**: SCREAMING_SNAKE_CASE in files (`APP_CONFIG`, `API_ENDPOINTS`)

### Component Organization
- **One component per file** (unless very small related components)
- **Co-locate related files** (component + styles + tests)
- **Index files for clean imports** (`components/events/index.ts`)

## 📦 Import/Export Patterns

### Index Files (Barrel Exports)
```typescript
// components/events/index.ts
export { default as EventCard } from './EventCard';
export { default as EventsGrid } from './EventsGrid';
export { default as EventsSection } from './EventsSection';
```

### Component Imports
```typescript
// Preferred: Feature-based imports
import { EventCard, EventsGrid } from '@/components/events';
import { Navigation, Header } from '@/components/layout';
import { Button, Modal } from '@/components/ui';

// Avoid: Direct file imports (except for single components)
import EventCard from '@/components/events/EventCard';
```

### Hook Patterns
```typescript
// hooks/index.ts
export { useAuth } from './useAuth';
export { useEvents } from './useEvents';
export { useLocalStorage } from './useLocalStorage';
```

## 🔧 Component Structure Standards

### Component File Template
```typescript
'use client'; // Only if needed for client components

import { useState, useEffect } from 'react';
import type { ComponentProps } from '@/types';
import { utilityFunction } from '@/lib/utils';
import { CONSTANTS } from '@/lib/constants';

interface ComponentNameProps {
  readonly prop1: string;
  readonly prop2?: number;
  readonly onAction?: () => void;
}

export default function ComponentName({ 
  prop1, 
  prop2 = defaultValue,
  onAction 
}: Readonly<ComponentNameProps>) {
  // State declarations
  const [state, setState] = useState<Type>(initialValue);
  
  // Custom hooks
  const { data, isLoading, error } = useCustomHook();
  
  // Effect hooks
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Event handlers
  const handleAction = () => {
    onAction?.();
  };
  
  // Early returns for loading/error states
  if (isLoading) return <LoadingComponent />;
  if (error) return <ErrorComponent error={error} />;
  
  // Main render
  return (
    <div className="component-styles">
      {/* Component JSX */}
    </div>
  );
}
```

### Custom Hook Template
```typescript
import { useState, useEffect } from 'react';
import type { HookReturnType } from '@/types';

export function useFeatureName(params?: Parameters) {
  const [data, setData] = useState<DataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hook logic
  }, [params]);

  return {
    data,
    isLoading,
    error,
    refetch: () => {/* refetch logic */}
  };
}
```

## 🎨 Styling Organization

### CSS Modules (if used)
```
components/
├── EventCard/
│   ├── EventCard.tsx
│   ├── EventCard.module.css
│   └── index.ts
```

### Tailwind CSS (current approach)
- Use utility classes directly in components
- Create reusable component variants
- Define custom utilities in `globals.css` if needed

## 📋 Type Organization

### Type File Structure
```typescript
// types/index.ts - Main exports
export * from './api';
export * from './auth';
export * from './events';

// types/events.ts - Feature-specific types
export interface Event {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  // ... other properties
}

export interface EventsApiResponse {
  readonly events: Event[];
  readonly total: number;
  readonly page: number;
}
```

## 🚀 Feature Development Workflow

### Adding a New Feature
1. **Create feature folder**: `components/[feature]/`
2. **Add main component**: `components/[feature]/FeatureSection.tsx`
3. **Create sub-components**: `components/[feature]/FeatureCard.tsx`
4. **Add custom hook**: `hooks/useFeature.ts`
5. **Define types**: `types/feature.ts`
6. **Add mock data**: `data/mockFeature.ts`
7. **Create index files**: Update all relevant `index.ts` files
8. **Update imports**: Use the new barrel exports

### Adding a New Page
1. **Create page file**: `app/[route]/page.tsx`
2. **Add layout if needed**: `app/[route]/layout.tsx`
3. **Create page components**: `components/[feature]/`
4. **Add navigation**: Update navigation components
5. **Define routes**: Add to route constants

## ⚡ Performance Considerations

### Code Splitting
- Use dynamic imports for large components
- Implement route-based code splitting
- Lazy load non-critical components

### Bundle Optimization
- Use barrel exports carefully (tree-shaking)
- Avoid importing entire libraries
- Implement proper memoization

## 🔍 Quality Standards

### TypeScript
- **Strict mode enabled**
- **No `any` types** (use `unknown` if needed)
- **Readonly props** for component interfaces
- **Proper error typing**

### Code Quality
- **No console.log** in production code
- **Proper error handling**
- **Consistent naming conventions**
- **Clean imports/exports**

## 📚 Documentation Standards

### Component Documentation
```typescript
/**
 * EventCard component displays individual event information
 * with actions for RSVP and sharing.
 * 
 * @param event - Event data object
 * @param onRSVP - Callback when user RSVPs
 * @param isCompact - Whether to show compact version
 */
export default function EventCard({ event, onRSVP, isCompact }: Props) {
  // Component implementation
}
```

### Hook Documentation
```typescript
/**
 * Custom hook for managing event data with caching and error handling
 * 
 * @param filters - Optional filters for events
 * @returns Object with events data, loading state, and error state
 */
export function useEvents(filters?: EventFilters) {
  // Hook implementation
}
```

## 🔄 Migration Guidelines

When refactoring existing code:
1. **Start with types** - Define proper TypeScript interfaces
2. **Extract utilities** - Move reusable functions to `lib/`
3. **Split components** - Break down large components
4. **Add custom hooks** - Extract stateful logic
5. **Update imports** - Use barrel exports
6. **Clean console logs** - Remove debug statements
7. **Add error handling** - Implement proper error boundaries

---

## 💡 Key Principles

1. **Feature-First Organization** - Group by what it does, not what it is
2. **Consistent Patterns** - Same patterns across all features
3. **Clean Imports** - Use barrel exports for better DX
4. **Type Safety** - Comprehensive TypeScript coverage
5. **Performance** - Consider bundle size and runtime performance
6. **Maintainability** - Easy to understand and modify
7. **Scalability** - Structure grows naturally with the app

This structure has been battle-tested and optimized for the Meetup application. Follow these patterns for all future development to maintain consistency and quality.