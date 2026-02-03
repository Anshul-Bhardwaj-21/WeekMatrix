# TimeMatrix Migration Guide

## Overview

TimeMatrix is the evolved version of WeekMatrix, expanding from weekly-only task tracking to comprehensive time-based task management across daily, weekly, monthly, and yearly periods.

## Key Changes

### 1. **App Renaming**
- **Package Name**: `weekmatrix` → `timematrix`
- **App Title**: WeekMatrix → TimeMatrix
- **Bundle ID**: Updated to reflect new name
- **GitHub Repo**: Now points to TimeMatrix repository

### 2. **Enhanced Data Model**

#### Old Structure (WeekMatrix)
```
users/{userId}/weeks/{YYYY-WW}/tasks/{taskId}:
  title: string
  matrix: { Mon: boolean, Tue: boolean, ... }
  createdAt: timestamp
```

#### New Structure (TimeMatrix)
```
users/{userId}/tasks/{taskId}:
  title: string
  description?: string
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startTime?: 'HH:MM'
  endTime?: 'HH:MM'
  reminderEnabled: boolean
  createdAt: timestamp
  updatedAt: timestamp

users/{userId}/tasks/{taskId}/progress/{progressId}:
  taskId: string
  date: 'YYYY-MM-DD'
  state: 'pending' | 'completed' | 'skipped'
  notes?: string
  completedAt?: timestamp
  skippedAt?: timestamp
```

### 3. **New Features**

#### **Time-Based Execution**
- Tasks can have start and end times
- Active task highlighting during execution
- Automatic completion prompts when tasks end

#### **Smart Notifications**
- Web Notifications API integration
- Reminder notifications 5 minutes before task ends
- Completion prompts when task time expires

#### **Enhanced Analytics**
- **Daily Streaks**: Current and longest streaks
- **Weekly Consistency**: Completion rate trends over time
- **Monthly Summary**: Bar charts of monthly progress
- **Yearly Overview**: Comprehensive annual statistics with pie charts

#### **JSON Import System**
- Import tasks from JSON files
- Paste JSON data directly
- Schema validation with helpful error messages
- Example JSON templates provided

#### **Multi-Period Support**
- Daily tasks (repeat every day)
- Weekly tasks (repeat every week)
- Monthly tasks (repeat every month)
- Yearly tasks (repeat every year)

### 4. **Backward Compatibility**

#### **Automatic Migration**
- Detects legacy WeekMatrix data automatically
- Shows migration button in dashboard when needed
- Converts weekly matrices to new progress format
- Preserves all completion history

#### **Bridge Service**
- `services/taskBridge.ts` maintains compatibility
- Existing components work without modification
- Gradual migration to new system

### 5. **UI Enhancements**

#### **Enhanced Task Matrix**
- Shows active tasks with visual indicators
- Time remaining display for active tasks
- Notification permission status
- Active tasks summary banner

#### **Tabbed Analytics**
- Streak tracking with visual progress bars
- Weekly consistency line charts
- Monthly progress bar charts
- Yearly overview with pie charts

#### **Improved Settings**
- Combined Analytics & Settings tab
- Better organization of user information
- Updated GitHub repository links

## Migration Process

### For Existing Users

1. **Automatic Detection**: App detects legacy data on first load
2. **Migration Prompt**: "Migrate" button appears in dashboard header
3. **One-Click Migration**: Click to convert all legacy data
4. **Verification**: Check that all tasks and progress are preserved
5. **New Features**: Start using time-based tasks and analytics

### For Developers

1. **Update Dependencies**: All required packages already included
2. **Firebase Rules**: Update security rules if needed
3. **Environment Variables**: No changes required
4. **Deployment**: Follow existing deployment process

## Technical Implementation

### **Services Architecture**
```
services/
├── tasks.ts              # Legacy weekly task service
├── taskBridge.ts         # Compatibility bridge
├── timeMatrix.ts         # New time-based task service
├── activeTaskManager.ts  # Real-time task monitoring
├── analytics.ts          # Enhanced analytics calculations
└── migration.ts          # Legacy data migration
```

### **Component Architecture**
```
components/dashboard/
├── Dashboard.tsx              # Main dashboard (updated)
├── TaskMatrix.tsx            # Legacy matrix component
├── EnhancedTaskMatrix.tsx    # New enhanced matrix
├── TimeMatrixAnalytics.tsx   # New analytics dashboard
├── JSONImport.tsx            # JSON import modal
└── AnalyticsDashboard.tsx    # Legacy analytics (kept for compatibility)
```

### **Type System**
```
types/index.ts:
├── Legacy types (LegacyTask, TaskMatrix)
├── New types (Task, TaskProgress, TaskState)
├── Analytics types (DailyStreak, WeeklyConsistency, etc.)
└── Import types (TaskImportSchema, TaskImportData)
```

## Testing Checklist

### **Basic Functionality**
- [ ] User authentication works
- [ ] Tasks can be created and deleted
- [ ] Task completion toggles work
- [ ] Progress is saved to Firestore

### **Migration**
- [ ] Legacy data is detected
- [ ] Migration button appears
- [ ] Migration completes successfully
- [ ] All progress is preserved

### **New Features**
- [ ] JSON import works with valid data
- [ ] JSON import shows errors for invalid data
- [ ] Active tasks are highlighted
- [ ] Notifications work (if permissions granted)
- [ ] Analytics show correct data

### **Cross-Platform**
- [ ] Web version works
- [ ] Mobile version works
- [ ] Data syncs between devices
- [ ] Offline functionality works

## Deployment Notes

### **No Breaking Changes**
- Existing Firebase setup continues to work
- No database migrations required
- Users can continue using the app normally

### **Gradual Rollout**
- Legacy components remain functional
- New features are additive
- Users can migrate at their own pace

### **Performance Considerations**
- New analytics queries are optimized
- Progress subcollections improve scalability
- Real-time monitoring uses efficient intervals

## Support

### **Common Issues**
1. **Migration doesn't appear**: Check browser console for errors
2. **Notifications don't work**: Ensure permissions are granted
3. **Analytics show no data**: Wait for tasks to be completed
4. **JSON import fails**: Validate JSON format against schema

### **Getting Help**
- Check browser developer console for errors
- Verify Firebase configuration
- Test with sample JSON data
- Review migration logs in console

## Future Enhancements

### **Planned Features** (Not in V1)
- Task categories and tags
- Custom time periods
- Team collaboration
- Advanced analytics
- Mobile push notifications
- Offline-first improvements

### **Architecture Improvements**
- Service worker for better offline support
- IndexedDB for local caching
- Background sync for progress updates
- Performance monitoring integration