# Firebase Setup Guide for EPCENTRA Tracker

Complete step-by-step guide to set up Firebase for the EPCENTRA Development Tracker.

## 📋 Prerequisites

- Google account
- Firebase project quota available (free tier is sufficient)
- Browser (Chrome recommended)

---

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console

Visit: https://console.firebase.google.com/

### 1.2 Create New Project

1. Click **"Add project"** or **"Create a project"**
2. **Project name**: Enter `epcentra-tracker`
3. Click **"Continue"**

### 1.3 Google Analytics (Optional)

1. Toggle **"Enable Google Analytics"** (Optional - recommended for production)
2. Select or create Analytics account
3. Click **"Create project"**
4. Wait for project creation (~30 seconds)
5. Click **"Continue"** when ready

---

## Step 2: Enable Authentication

### 2.1 Navigate to Authentication

1. In the left sidebar, click **"Authentication"**
2. Click **"Get started"**

### 2.2 Enable Email/Password Provider

1. Click on **"Sign-in method"** tab
2. Click on **"Email/Password"** provider
3. **Enable** the toggle
4. Enable **"Email/Password"** (NOT "Email link")
5. Click **"Save"**

### 2.3 (Optional) Additional Providers

You can also enable:
- **Google** (recommended for quick sign-in)
- **GitHub** (for developer convenience)

---

## Step 3: Create Firestore Database

### 3.1 Navigate to Firestore

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**

### 3.2 Security Rules

1. Select **"Start in test mode"** (for development)
   - This allows read/write access for 30 days
   - We'll update security rules later
2. Click **"Next"**

### 3.3 Cloud Firestore Location

1. Select location closest to your team:
   - **US**: `us-central` (Iowa)
   - **Europe**: `europe-west` (Belgium)
   - **Asia**: `asia-south1` (Mumbai) or `asia-southeast1` (Singapore)
2. **Important**: Location cannot be changed later
3. Click **"Enable"**
4. Wait for database creation (~1 minute)

---

## Step 4: Set Up Security Rules

### 4.1 Navigate to Rules

1. In Firestore Database, click **"Rules"** tab
2. You'll see default test mode rules

### 4.2 Update Security Rules

Replace the default rules with production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read user profiles
      allow read: if isAuthenticated();
      
      // Users can only write their own profile
      allow write: if isOwner(userId);
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      // All authenticated users can read tasks
      allow read: if isAuthenticated();
      
      // All authenticated users can create tasks
      allow create: if isAuthenticated() 
        && request.resource.data.createdBy == request.auth.uid;
      
      // Users can update tasks they created or are assigned to
      allow update: if isAuthenticated() 
        && (resource.data.createdBy == request.auth.uid 
            || request.auth.uid in resource.data.assignedTo);
      
      // Only task creator can delete
      allow delete: if isAuthenticated() 
        && resource.data.createdBy == request.auth.uid;
    }
    
    // Comments collection
    match /comments/{commentId} {
      // All authenticated users can read comments
      allow read: if isAuthenticated();
      
      // Users can create comments
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid;
      
      // Users can delete their own comments
      allow delete: if isAuthenticated() 
        && resource.data.userId == request.auth.uid;
    }
    
    // Time entries collection
    match /timeEntries/{entryId} {
      // All authenticated users can read time entries
      allow read: if isAuthenticated();
      
      // Users can create their own time entries
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid;
      
      // Users can update their own time entries
      allow update: if isAuthenticated() 
        && resource.data.userId == request.auth.uid;
    }
    
    // Activities collection
    match /activities/{activityId} {
      // All authenticated users can read activities
      allow read: if isAuthenticated();
      
      // Only authenticated users can create activities
      allow create: if isAuthenticated();
    }
    
    // Milestones collection
    match /milestones/{milestoneId} {
      // All authenticated users can read milestones
      allow read: if isAuthenticated();
      
      // All authenticated users can create/update milestones
      allow write: if isAuthenticated();
    }
  }
}
```

### 4.3 Publish Rules

1. Click **"Publish"** button
2. Rules will take effect immediately

---

## Step 5: Get Firebase Configuration

### 5.1 Register Web App

1. In Project Overview, click the **gear icon** → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click the **"</>"** (Web) icon
4. **App nickname**: Enter `epcentra-tracker-web`
5. **Don't** check "Also set up Firebase Hosting"
6. Click **"Register app"**

### 5.2 Copy Configuration

You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**Copy this entire object** - you'll need it in the next step.

### 5.3 Update Your App

1. Open `src/lib/firebase.ts` in your code editor
2. Replace the placeholder config with your actual config:

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

3. **Save the file**
4. **Don't commit this file with your actual keys to public repositories!**

---

## Step 6: Initialize Firestore Collections

### 6.1 Create Initial Collections

Firestore creates collections automatically when you add the first document. However, you can create them manually:

1. In Firestore Database, click **"Start collection"**
2. **Collection ID**: `users`
3. Click **"Next"**
4. **Document ID**: Leave as "Auto-ID"
5. Add a placeholder field:
   - **Field**: `placeholder`
   - **Type**: `string`
   - **Value**: `delete_me`
6. Click **"Save"**
7. Delete this document after first user signs up

Repeat for other collections:
- `tasks`
- `comments`
- `timeEntries`
- `activities`
- `milestones`

**Note**: Collections are created automatically when you add data, so this step is optional.

---

## Step 7: Create Composite Indexes

For efficient queries, create composite indexes:

### 7.1 Navigate to Indexes

1. In Firestore Database, click **"Indexes"** tab
2. Click **"Create index"**

### 7.2 Create Task Indexes

**Index 1: Tasks by Phase and Status**
- Collection ID: `tasks`
- Fields:
  - `phase` (Ascending)
  - `status` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection
- Click **"Create index"** (takes 2-5 minutes)

**Index 2: Tasks by Assigned User**
- Collection ID: `tasks`
- Fields:
  - `assignedTo` (Array-contains)
  - `status` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection
- Click **"Create index"**

---

## Step 8: Test Your Setup

### 8.1 Run Your App

```bash
npm run dev
```

### 8.2 Sign Up

1. Navigate to `http://localhost:3000/login`
2. Click **"Sign Up"** tab
3. Enter:
   - Display Name: `Admin User`
   - Email: `admin@epcentra.com`
   - Password: `admin123456`
   - Role: `Admin`
4. Click **"Sign Up"**

### 8.3 Verify in Firebase Console

1. Go to **Authentication** in Firebase Console
2. You should see your new user in the **"Users"** tab
3. Go to **Firestore Database**
4. You should see a new document in the `users` collection

### 8.4 Create a Test Task

1. In your app, go to **Tasks** page
2. Click **"Create Task"**
3. Fill in task details
4. Click **"Create Task"**
5. Verify task appears in Firebase Firestore → `tasks` collection

---

## Step 9: Environment Variables (Optional - Recommended)

For better security, use environment variables:

### 9.1 Create .env.local

```bash
# .env.local
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 9.2 Update firebase.ts

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

### 9.3 Add to .gitignore

Ensure `.env.local` is in your `.gitignore` file (already included in template).

---

## Step 10: Production Setup

### 10.1 Update Security Rules for Production

When deploying to production, use stricter security rules.

### 10.2 Enable Billing (if needed)

Free tier limits:
- **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day
- **Authentication**: Unlimited users
- **Hosting**: 10 GB storage, 360 MB/day transfer

For production app, consider upgrading to Blaze (pay-as-you-go) plan.

### 10.3 Set Up Cloud Functions (Optional)

For automated tasks like:
- Sending email notifications
- Scheduled data cleanup
- Complex calculations

---

## 🐛 Troubleshooting

### Issue: "Firebase: Error (auth/configuration-not-found)"

**Solution**: Make sure you've enabled Email/Password authentication in Firebase Console.

### Issue: "Missing or insufficient permissions"

**Solution**: 
1. Check Firestore security rules
2. Ensure user is authenticated
3. Verify rules syntax is correct

### Issue: "Quota exceeded"

**Solution**: 
1. Check Firebase Console → Usage tab
2. Optimize queries (reduce reads)
3. Consider upgrading to paid plan

### Issue: Can't access Firestore from app

**Solution**:
1. Verify Firebase config is correct
2. Check browser console for errors
3. Ensure Firestore is created (not just enabled)
4. Check network tab for API calls

---

## 📚 Additional Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Firestore Data Model**: https://firebase.google.com/docs/firestore/data-model
- **Security Rules Guide**: https://firebase.google.com/docs/firestore/security/get-started
- **Firebase Pricing**: https://firebase.google.com/pricing

---

## ✅ Setup Complete!

Your Firebase backend is now ready for the EPCENTRA Development Tracker!

Next steps:
1. Invite team members to sign up
2. Create tasks for each phase
3. Start tracking progress

---

**EPCENTRA** — *Engineered for Execution*

For questions: dev@epcentra.com
