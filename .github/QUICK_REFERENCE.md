# 🚀 Quick Reference - Project Structure

## 📁 Where to Put New Code

### 🎯 Adding a New Feature (e.g., "messages")
```
1. components/messages/           # Feature components
   ├── index.ts                  # Export all components
   ├── MessagesSection.tsx       # Main section component
   ├── MessageCard.tsx           # Individual message
   └── MessagesList.tsx          # List container

2. hooks/useMessages.ts          # Custom hook for data
3. types/messages.ts             # TypeScript interfaces
4. data/mockMessages.ts          # Mock data (if needed)
```

### 🧩 Adding a Reusable Component
```
components/ui/
├── NewComponent.tsx             # The component
└── index.ts                     # Add export
```

### 🎣 Adding a Custom Hook
```
hooks/
├── useNewHook.ts               # The hook
└── index.ts                    # Add export
```

### 🔧 Adding Utilities
```
lib/
├── newUtility.ts               # Utility functions
├── constants.ts                # Add new constants
└── index.ts                    # Add exports
```

## 📋 Import Patterns

### ✅ Good Imports
```typescript
// Feature components
import { EventCard, EventsGrid } from '@/components/events';

// Layout components  
import { Navigation, Header } from '@/components/layout';

// UI components
import { Button, Modal, Loading } from '@/components/ui';

// Hooks
import { useEvents, useAuth } from '@/hooks';

// Utils & constants
import { formatDate, APP_CONFIG } from '@/lib';

// Types
import type { Event, User } from '@/types';
```

### ❌ Avoid These Imports
```typescript
// Don't import directly from files
import EventCard from '@/components/events/EventCard';
import { formatDate } from '@/lib/utils';

// Don't use relative imports for features
import EventCard from '../events/EventCard';
```

## 🏗️ Component Structure

```typescript
'use client'; // Only if needed

// 1. React imports
import { useState, useEffect } from 'react';

// 2. Type imports
import type { ComponentProps } from '@/types';

// 3. Internal imports (hooks, utils)
import { useCustomHook } from '@/hooks';
import { CONSTANTS } from '@/lib';

// 4. Component imports
import { Button } from '@/components/ui';

interface Props {
  readonly prop: string;
  readonly optional?: number;
}

export default function Component({ prop, optional }: Readonly<Props>) {
  // Implementation
}
```

## 🎯 File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `EventCard.tsx` |
| Hooks | camelCase + use | `useEvents.ts` |
| Utils | camelCase | `formatDate.ts` |
| Types | camelCase | `eventTypes.ts` |
| Constants | UPPER_SNAKE | `API_ENDPOINTS` |

## 🔄 Development Checklist

### Before Adding New Component:
- [ ] Is this a feature component? → `components/[feature]/`
- [ ] Is this reusable UI? → `components/ui/`
- [ ] Is this layout related? → `components/layout/`
- [ ] Does it need custom logic? → Create hook in `hooks/`
- [ ] Does it need types? → Add to `types/`
- [ ] Update index.ts files for clean imports

### Code Quality Check:
- [ ] No console.log statements
- [ ] Props are readonly
- [ ] Proper TypeScript types
- [ ] Clean imports using barrel exports
- [ ] Error handling implemented
- [ ] Loading states handled

---

**Remember**: This structure is designed for maintainability and scalability. When in doubt, follow existing patterns!