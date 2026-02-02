# WeekMatrix Project Structure

## Overview
This is a production-ready React Native app built with Expo that provides a weekly task matrix for tracking daily progress across tasks.

## Project Structure

```
weekmatrix/
├── app/                          # Expo Router app directory
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── index.tsx            # Main dashboard screen
│   │   ├── explore.tsx          # Settings/about screen
│   │   └── _layout.tsx          # Tab navigation layout
│   ├── modal.tsx                # Modal screen (unused in V1)
│   └── _layout.tsx              # Root app layout with auth provider
│
├── components/                   # Reusable UI components
│   ├── auth/                    # Authentication components
│   │   └── AuthScreen.tsx       # Login/signup screen
│   ├── dashboard/               # Dashboard components
│   │   ├── Dashboard.tsx        # Main dashboard container
│   │   ├── TaskMatrix.tsx       # Weekly task grid component
│   │   ├── AddTaskForm.tsx      # Add new task form
│   │   ├── ProgressChart.tsx    # Weekly progress chart
│   │   └── TaskList.tsx         # Task list with delete functionality
│   ├── ui/                      # Base UI components
│   │   ├── collapsible.tsx      # Collapsible component (existing)
│   │   ├── icon-symbol.tsx      # Icon component (existing)
│   │   └── tab-bar-background.tsx # Tab bar blur background
│   ├── themed-text.tsx          # Themed text component
│   ├── themed-view.tsx          # Themed view component
│   ├── external-link.tsx        # External link component (existing)
│   ├── haptic-tab.tsx           # Haptic feedback tab (existing)
│   ├── hello-wave.tsx           # Hello wave animation (existing)
│   └── parallax-scroll-view.tsx # Parallax scroll view (existing)
│
├── config/                      # Configuration files
│   └── firebase.ts              # Firebase initialization and config
│
├── contexts/                    # React contexts
│   └── AuthContext.tsx          # Authentication context provider
│
├── hooks/                       # Custom React hooks
│   ├── use-color-scheme.ts      # Color scheme hook (existing)
│   └── use-theme-color.ts       # Theme color hook (existing)
│
├── services/                    # Business logic and API services
│   ├── auth.ts                  # Firebase authentication service
│   └── tasks.ts                 # Task CRUD operations service
│
├── utils/                       # Utility functions
│   ├── dateUtils.ts             # Date and week calculation utilities
│   └── progressUtils.ts         # Progress calculation utilities
│
├── constants/                   # App constants
│   └── theme.ts                 # Theme colors, spacing, typography
│
├── assets/                      # Static assets
│   ├── images/                  # App icons and images
│   └── fonts/                   # Custom fonts (if any)
│
├── .expo/                       # Expo configuration (auto-generated)
├── node_modules/                # Dependencies
│
├── package.json                 # Dependencies and scripts
├── app.json                     # Expo app configuration
├── eas.json                     # EAS Build configuration
├── tsconfig.json                # TypeScript configuration
├── eslint.config.js             # ESLint configuration
├── expo-env.d.ts                # Expo TypeScript definitions
│
├── README.md                    # Project documentation
├── FIREBASE_SETUP.md            # Firebase setup instructions
├── PROJECT_STRUCTURE.md         # This file
├── .env.example                 # Environment variables example
└── .gitignore                   # Git ignore rules
```

## Key Architecture Decisions

### 1. **Expo Router for Navigation**
- File-based routing system
- Tab-based navigation for main screens
- Automatic deep linking support

### 2. **Firebase Backend**
- Authentication with email/password
- Firestore for real-time data sync
- Offline-first with automatic sync

### 3. **Theme System**
- Custom theme with dark/light mode support
- Consistent spacing, colors, and typography
- Themed components for easy styling

### 4. **Component Architecture**
- Separation of concerns (UI, business logic, services)
- Reusable themed components
- Context-based state management for auth

### 5. **Data Structure**
- User-scoped data in Firestore
- Week-based task organization (YYYY-WW format)
- Optimistic updates for better UX

## Core Features Implementation

### Authentication Flow
- `AuthContext` manages authentication state
- `AuthScreen` handles login/signup
- Automatic redirect based on auth state

### Task Management
- `TaskMatrix` component for visual grid
- Real-time updates with Firestore
- Optimistic UI updates for responsiveness

### Progress Tracking
- `ProgressChart` with react-native-chart-kit
- Calculated progress percentages
- Daily and overall completion tracking

### Cross-Platform Support
- React Native Web for web deployment
- Responsive design for mobile and desktop
- Platform-specific optimizations

## Development Workflow

1. **Local Development**: `npm start`
2. **Testing**: Manual testing on multiple platforms
3. **Building**: `eas build` for app stores
4. **Deployment**: Firebase Hosting for web, EAS for mobile

## Production Considerations

- Error handling and loading states
- Offline functionality
- Performance optimizations
- Security rules for Firestore
- Environment-based configuration