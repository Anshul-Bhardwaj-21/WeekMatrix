# TimeMatrix

A personal time-based task matrix app that helps you track daily, weekly, monthly, and yearly progress across tasks, synced across devices using Firebase.

## Features

- **Time-Based Task Matrix**: Visual tracking for daily, weekly, monthly, and yearly tasks
- **Real-time Sync**: Data synced across all your devices via Firebase
- **Progress Tracking**: Per-task and overall completion percentages with streaks
- **Visual Analytics**: Charts showing daily streaks, weekly consistency, monthly summaries
- **JSON Import**: Import tasks from JSON files or paste JSON data
- **Smart Notifications**: Web notifications for task reminders and completion prompts
- **Cross-platform**: Works on mobile (iOS/Android) and web
- **Dark Mode**: Automatic dark/light theme support
- **Offline-first**: Works offline with automatic sync when online

## Migration from WeekMatrix

If you're upgrading from the original WeekMatrix app, TimeMatrix includes automatic migration:

1. **Automatic Detection**: The app detects legacy weekly task data
2. **Migration Prompt**: A "Migrate" button appears in the dashboard header
3. **Data Conversion**: Legacy weekly matrices are converted to the new time-based format
4. **Progress Preservation**: All completion history is maintained

### What's New in TimeMatrix

- **Multi-Period Support**: Daily, weekly, monthly, and yearly tasks
- **Time-Based Execution**: Tasks with start/end times and active status
- **Smart Notifications**: Web notifications for task reminders
- **Enhanced Analytics**: Streaks, consistency tracking, and yearly overviews
- **JSON Import**: Import tasks from JSON files or paste JSON data
- **Active Task Monitoring**: Real-time tracking of currently active tasks

## Data Structure

TimeMatrix uses an enhanced Firestore structure:

```
users/{userId}/
  profile: { email, createdAt }
  tasks/{taskId}: {
    title: string
    description?: string
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
    startTime?: 'HH:MM'
    endTime?: 'HH:MM'
    reminderEnabled: boolean
    createdAt: timestamp
    updatedAt: timestamp
  }
  tasks/{taskId}/progress/{progressId}: {
    taskId: string
    date: 'YYYY-MM-DD'
    state: 'pending' | 'completed' | 'skipped'
    notes?: string
    completedAt?: timestamp
    skippedAt?: timestamp
  }
```

## JSON Import Schema

You can import tasks using this JSON format:

```json
{
  "tasks": [
    {
      "title": "Morning Exercise",
      "description": "30 minutes of cardio",
      "period": "daily",
      "startTime": "07:00",
      "endTime": "07:30",
      "reminderEnabled": true
    },
    {
      "title": "Weekly Review",
      "description": "Review goals and progress",
      "period": "weekly",
      "startTime": "09:00",
      "endTime": "10:00",
      "reminderEnabled": false
    }
  ]
}
```

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Auth + Firestore)
- **Charts**: react-native-chart-kit
- **Navigation**: Expo Router
- **Styling**: Custom theme system with dark mode

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/weekmatrix.git
   cd weekmatrix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Follow the detailed instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   - Update `config/firebase.ts` with your Firebase configuration

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your preferred platform**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator  
   - Press `w` for web browser
   - Scan QR code with Expo Go app for physical device

## Usage

1. **Sign up/Sign in** with email and password
2. **Add tasks** using the input field at the top
3. **Toggle checkboxes** in the matrix to mark tasks complete for each day
4. **View progress** in the chart and percentage indicators
5. **Delete tasks** using the × button in the task list

## Data Structure

Tasks are organized by week (YYYY-WW format) and stored per user:

```
users/{userId}/weeks/{weekId}/tasks/{taskId}
```

Each task contains:
- `title`: Task name
- `matrix`: Object with Mon-Sun boolean values
- `createdAt`: Timestamp

## Deployment

### Web (Firebase Hosting)

1. **Build for web**
   ```bash
   npx expo export -p web
   ```

2. **Deploy to Firebase Hosting**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

### Mobile (Expo Application Services)

1. **Build for app stores**
   ```bash
   npx eas build --platform all
   ```

2. **Submit to stores**
   ```bash
   npx eas submit --platform all
   ```

## Development

### Project Structure

```
├── app/                    # Expo Router pages
├── components/            # Reusable UI components
│   ├── auth/             # Authentication screens
│   ├── dashboard/        # Dashboard components
│   └── ui/               # Base UI components
├── config/               # Configuration files
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── services/             # Firebase services
├── utils/                # Utility functions
└── constants/            # Theme and constants
```

### Key Files

- `config/firebase.ts` - Firebase configuration
- `services/auth.ts` - Authentication logic
- `services/tasks.ts` - Task CRUD operations
- `utils/dateUtils.ts` - Week calculation utilities
- `constants/theme.ts` - App theme and colors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues:

1. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for setup issues
2. Open an issue on GitHub
3. Check Expo documentation for platform-specific issues

## Roadmap

Future enhancements (not in V1):
- Task categories and colors
- Weekly/monthly views
- Export data functionality
- Team collaboration features
- Push notifications
- Habit tracking analytics