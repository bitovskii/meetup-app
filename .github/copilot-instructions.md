# Meetup App - VS Code Workspace Instructions

## Project Overview
This is a modern React meetup application built with Next.js 15.5.4, TypeScript, and Tailwind CSS. The app features responsive design with mobile-optimized navigation and is connected to Supabase for dynamic data management.

## Technology Stack
- **Framework**: Next.js 15.5.4 with Turbopack
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **UI Components**: Custom cards with performance-optimized hover effects
- **Navigation**: Responsive hamburger menu for mobile devices

## Key Features
- ✅ Mobile-responsive navigation (optimized for iPhone 16 Pro Max)
- ✅ Dynamic event and group cards with Supabase integration
- ✅ Performance-optimized hover animations (200ms transitions)
- ✅ Dark mode support
- ✅ TypeScript type safety
- ✅ Custom React hooks for data fetching

## Development Setup
1. **Environment**: Configure `.env.local` with Supabase credentials
2. **Dependencies**: All packages installed via npm
3. **Database**: Supabase client configured with custom hooks
4. **Performance**: Hover effects optimized with `will-change` hints and reduced animation durations

## Component Structure
- `src/app/page.tsx` - Main application entry with Supabase integration
- `src/components/Navigation.tsx` - Responsive navigation with mobile menu
- `src/components/EventCard.tsx` - Performance-optimized event cards
- `src/components/GroupsSection.tsx` - Groups page with dynamic data
- `src/hooks/useSupabase.ts` - Custom hooks for database operations
- `src/lib/supabase.ts` - Supabase client and TypeScript interfaces

## Performance Optimizations
- Reduced animation durations from 300-700ms to 200ms
- Added `will-change-transform` for GPU acceleration
- Simplified glow effects for better performance
- Optimized hover states with efficient CSS transitions

## Database Schema
Complete schema available in `database/schema.sql` with sample data for events and groups tables.

## Running the Application
- Development: `npm run dev` (with Turbopack)
- Build: `npm run build`
- Production: `npm start`
- Local URL: http://localhost:3000