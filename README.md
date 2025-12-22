# The 28th Day - PCOS Management App

A Next.js application designed to help Nigerian women manage PCOS through personalized cycle tracking, nutrition guidance with local foods, and AI-powered insights.

## ✅ Phase 1: Authentication - COMPLETE!

**Google Sign-in is fully implemented and working!**
- ✅ Firebase Authentication with Google provider
- ✅ User profile management in Firestore
- ✅ Protected routes and middleware
- ✅ Onboarding flow for new users
- ✅ Session management with auto-redirect

👉 **See [PHASE1_COMPLETE.md](./PHASE1_COMPLETE.md)** for testing guide
👉 **See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** for Firebase configuration

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Backend**: Firebase (Authentication + Firestore)
- **AI**: Google Gemini API

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Firebase
1. Follow instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. Copy `.env.example` to `.env.local`
3. Add your Firebase credentials to `.env.local`

### 3. Run the App
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Test Authentication
1. Click "Sign In" on the landing page
2. Sign in with your Google account
3. Complete the onboarding form (new users only)
4. Access your dashboard!

## Features

### ✅ Implemented (Phase 1)
- 🔐 **Google Authentication**: Sign in with Google
- 👤 **User Profiles**: Stored securely in Firestore
- 🛡️ **Protected Routes**: Automatic redirect for auth
- 📝 **Onboarding**: First-time user setup flow
- 🎨 **Responsive UI**: Mobile-friendly with dark mode

### 🚧 Coming Soon
- 📅 **Cycle Tracking**: Monitor menstrual cycles (Phase 2)
- 💊 **Symptom Logging**: Track PCOS symptoms (Phase 2)
- 🍽️ **Nutrition Tracker**: Nigerian foods database (Phase 3)
- 💡 **AI Insights**: Gemini-powered recommendations (Phase 4)

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/         # Dashboard routes
│   │   ├── dashboard/
│   │   ├── cycle-tracker/
│   │   ├── symptoms/
│   │   ├── nutrition/
│   │   ├── insights/
│   │   └── layout.tsx
│   ├── api/                 # API routes
│   │   ├── gemini/
│   │   └── health/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── auth/                # Authentication components
│   ├── dashboard/           # Dashboard components
│   ├── layout/              # Layout components
│   └── providers/           # Context providers
├── types/                   # TypeScript type definitions
│   ├── user.ts
│   ├── cycle.ts
│   ├── symptom.ts
│   └── nutrition.ts
├── context/                 # React contexts
│   └── AuthContext.tsx
├── lib/                     # Utility functions
│   ├── firebase.ts
│   ├── firestore.ts
│   ├── cycleUtils.ts
│   └── utils.ts
└── hooks/                   # Custom React hooks
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase and Gemini API credentials

3. **Install additional dependencies**:
   ```bash
   npm install firebase class-variance-authority clsx tailwind-merge
   npm install @radix-ui/react-slot
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- 📅 **Cycle Tracking**: Monitor menstrual cycles and predict next period
- 💊 **Symptom Logging**: Track PCOS symptoms with mood and energy levels
- 🍽️ **Nutrition Tracker**: Log meals featuring Nigerian foods
- 💡 **AI Insights**: Get personalized health recommendations
- 🔐 **Authentication**: Secure Firebase authentication
- 🌙 **Dark Mode**: Full dark mode support

## Next Steps

1. Configure Firebase project and add credentials to `.env.local`
2. Set up Gemini API key
3. Implement Firebase authentication in `AuthContext.tsx`
4. Add Nigerian food database to Firestore
5. Integrate Gemini API for AI insights
6. Add data visualization charts
7. Implement cycle prediction algorithm refinements

## Contributing

This app is designed to support Nigerian women with PCOS. Contributions that improve accessibility, add Nigerian food data, or enhance health tracking features are welcome.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
