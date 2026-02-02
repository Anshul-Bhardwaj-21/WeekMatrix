# Firebase Setup Instructions

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `weekmatrix` (or your preferred name)
4. Disable Google Analytics (not needed for this app)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. Click on **Email/Password**
3. Enable **Email/Password** (first option)
4. Click **Save**

## 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select your preferred location
5. Click **Done**

## 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click **Web** icon (`</>`)
4. Register app with nickname: `weekmatrix-web`
5. Copy the `firebaseConfig` object

## 5. Update App Configuration

1. Open `config/firebase.ts`
2. Replace the placeholder config with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "your-actual-app-id"
};
```

## 6. Firestore Security Rules (Optional for Production)

For production, update Firestore rules to secure user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 7. Test the Setup

1. Run the app: `npm start`
2. Create a test account
3. Add a task and toggle some checkboxes
4. Check Firestore console to see data being created

## Firestore Data Structure

The app creates the following structure:

```
users/
  {userId}/
    profile:
      email: string
      createdAt: timestamp
    weeks/
      {YYYY-WW}/
        tasks/
          {taskId}:
            title: string
            matrix:
              Mon: boolean
              Tue: boolean
              Wed: boolean
              Thu: boolean
              Fri: boolean
              Sat: boolean
              Sun: boolean
            createdAt: timestamp
```

## Firebase Pricing

This app uses only free Firebase features:
- **Authentication**: 50,000 MAU free
- **Firestore**: 1 GiB storage, 50K reads, 20K writes per day free
- **Hosting** (if deployed): 10 GB storage, 10 GB transfer per month free

Perfect for personal use and small teams!