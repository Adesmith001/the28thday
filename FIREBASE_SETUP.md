# Firebase Setup Guide for The 28th Day

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `the-28th-day`
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, click "Authentication" from the left menu
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable **Google** sign-in provider:
   - Click on "Google"
   - Toggle "Enable"
   - Set project support email
   - Click "Save"

## Step 3: Create Firestore Database

1. In Firebase Console, click "Firestore Database" from the left menu
2. Click "Create database"
3. Select "Start in production mode" (we'll add rules later)
4. Choose your Cloud Firestore location (e.g., us-central)
5. Click "Enable"

### Firestore Security Rules

After creating the database, update the rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own health data
    match /cycles/{cycleId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /symptoms/{symptomId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /meals/{mealId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## Step 4: Get Firebase Configuration

1. In Firebase Console, click the gear icon (⚙️) → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register app with nickname: "The 28th Day Web"
5. Copy the configuration object

## Step 5: Configure Environment Variables

1. In your project root, create `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Gemini API (for Phase 2)
GEMINI_API_KEY=your_gemini_api_key_here
```

2. Replace the values with your actual Firebase config values

## Step 6: Install Dependencies

```bash
npm install firebase
```

## Step 7: Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Testing the Authentication Flow

1. Navigate to `/login`
2. Click "Sign in with Google"
3. Select your Google account
4. First-time users will be redirected to `/onboarding`
5. Fill in the onboarding form
6. You'll be redirected to `/dashboard`

## Authorized Domains (for Production)

When deploying, add your domain to Firebase:

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Click "Add domain"
3. Enter your production domain (e.g., `the28thday.com`)

## Troubleshooting

### "auth/unauthorized-domain" Error
- Add `localhost` to authorized domains in Firebase Console
- For production, add your deployment domain

### "Missing or insufficient permissions" Error
- Check Firestore security rules
- Ensure user is authenticated
- Verify userId matches in the document

### Google Sign-in popup blocked
- Check browser popup blocker settings
- Ensure `localhost` is in authorized domains

## Next Steps

✅ **Phase 1 Complete!** You now have:
- Google authentication working
- User profiles in Firestore
- Protected routes
- Onboarding flow for new users

**Ready for Phase 2:** Implement cycle tracking functionality
