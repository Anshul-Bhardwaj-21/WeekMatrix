# WeekMatrix Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Firebase project set up (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))
- Expo CLI installed: `npm install -g @expo/cli`
- EAS CLI installed: `npm install -g eas-cli`

## Local Development

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd weekmatrix
   npm install
   ```

2. **Configure Firebase**
   - Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   - Update `config/firebase.ts` with your Firebase config

3. **Start Development Server**
   ```bash
   npm start
   # Then press 'w' for web, 'i' for iOS, 'a' for Android
   ```

## Web Deployment (Firebase Hosting)

### 1. Build for Web
```bash
npx expo export -p web
```

### 2. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 3. Initialize Firebase Hosting
```bash
firebase init hosting
# Select your Firebase project
# Set public directory to: dist
# Configure as single-page app: Yes
# Set up automatic builds: No
```

### 4. Deploy
```bash
firebase deploy --only hosting
```

Your app will be available at: `https://your-project-id.web.app`

## Mobile Deployment (App Stores)

### 1. Configure EAS
```bash
eas login
eas build:configure
```

### 2. Update app.json
```json
{
  "expo": {
    "name": "WeekMatrix",
    "slug": "weekmatrix",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.weekmatrix"
    },
    "android": {
      "package": "com.yourcompany.weekmatrix"
    },
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### 3. Build for App Stores
```bash
# Build for both platforms
eas build --platform all

# Or build individually
eas build --platform ios
eas build --platform android
```

### 4. Submit to App Stores
```bash
# Submit to both stores
eas submit --platform all

# Or submit individually
eas submit --platform ios
eas submit --platform android
```

## Environment Configuration

### Development (.env.local)
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your-dev-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-dev-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-dev-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=your-dev-app-id
```

### Production (.env.production)
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your-prod-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-prod-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-prod-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321
EXPO_PUBLIC_FIREBASE_APP_ID=your-prod-app-id
```

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy WeekMatrix

on:
  push:
    branches: [main]

jobs:
  web-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build for web
        run: npx expo export -p web
        env:
          EXPO_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          EXPO_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          EXPO_PUBLIC_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
      
      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-firebase-project-id

  mobile-build:
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.message, '[mobile]')
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build mobile apps
        run: eas build --platform all --non-interactive
```

## Performance Optimization

### 1. Bundle Analysis
```bash
npx expo export -p web --dump-assetmap
# Analyze the generated asset map
```

### 2. Image Optimization
- Use WebP format for web
- Provide multiple resolutions (@2x, @3x)
- Compress images before including

### 3. Code Splitting
```typescript
// Lazy load heavy components
const ProgressChart = React.lazy(() => import('./ProgressChart'));

// Use with Suspense
<Suspense fallback={<Loading />}>
  <ProgressChart tasks={tasks} />
</Suspense>
```

## Monitoring and Analytics

### 1. Firebase Analytics (Optional)
```bash
npm install @react-native-firebase/analytics
```

### 2. Error Tracking
```bash
npm install @sentry/react-native
```

### 3. Performance Monitoring
```bash
npm install @react-native-firebase/perf
```

## Security Checklist

- [ ] Firebase security rules configured
- [ ] API keys restricted to specific domains/apps
- [ ] Environment variables used for sensitive data
- [ ] HTTPS enforced for all connections
- [ ] Input validation implemented
- [ ] Authentication required for all user data
- [ ] Regular dependency updates

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (18+)
   - Clear cache: `npx expo start --clear`
   - Delete node_modules and reinstall

2. **Firebase Connection Issues**
   - Verify Firebase config
   - Check network connectivity
   - Ensure Firebase project is active

3. **Web App Not Loading**
   - Check browser console for errors
   - Verify Firebase Hosting configuration
   - Check domain/SSL settings

4. **Mobile App Crashes**
   - Check device logs
   - Verify native dependencies
   - Test on different devices/OS versions

### Getting Help

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Documentation](https://reactnative.dev/docs)
- [GitHub Issues](https://github.com/your-username/weekmatrix/issues)

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor Firebase usage
- Review security rules
- Check app store reviews
- Update documentation

### Backup Strategy
- Firebase data is automatically backed up
- Export user data periodically
- Keep configuration files in version control
- Document deployment procedures