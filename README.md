# EPCENTRA Development Tracker

A comprehensive React + Firebase application for tracking the 44-week EPCENTRA development roadmap.

## 🎯 Features

- **Dashboard**: Real-time overview of project progress
- **Task Management**: Create, update, and track tasks with Kanban board
- **Roadmap**: Visual timeline of all 7 phases
- **Team Management**: Track team members and their workload
- **Real-time Updates**: Firebase Firestore for live data synchronization
- **User Authentication**: Email/password authentication with role-based access
- **Progress Tracking**: Phase-wise and task-wise progress visualization
- **Time Tracking**: Estimated vs actual hours tracking
- **Activity Feed**: Real-time activity log

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Git

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd epcentra-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Firebase Setup

#### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "epcentra-tracker"
4. Follow the setup wizard

#### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method

#### Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **Test mode** (for development)
4. Choose a location closest to you
5. Click "Enable"

#### Step 4: Set Firestore Security Rules

Go to **Firestore Database → Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Comments collection
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Time entries collection
    match /timeEntries/{entryId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Activities collection
    match /activities/{activityId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

#### Step 5: Get Firebase Config

1. In Firebase Console, click the gear icon → Project settings
2. Scroll down to "Your apps"
3. Click the web icon (</>) to add a web app
4. Register app with nickname "epcentra-tracker-web"
5. Copy the firebaseConfig object

#### Step 6: Configure Firebase in Your App

1. Open `src/lib/firebase.ts`
2. Replace the placeholder config with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 4. Run the application

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## 📱 Usage

### First Time Setup

1. **Sign Up**: Create your first account with admin role
2. **Create Tasks**: Start creating tasks for each phase
3. **Assign Team Members**: Invite team members to sign up
4. **Track Progress**: Update task status and progress as you work

### Creating Tasks

1. Go to **Tasks** page
2. Click **Create Task** button
3. Fill in task details:
   - Title and description
   - Phase (1-7)
   - Week (1-44)
   - Status, Priority
   - Start/End dates
   - Estimated hours
   - Tags
4. Click **Create Task**

### Tracking Progress

1. Click on any task card to open details
2. Update status (Pending → In Progress → Completed)
3. Update progress percentage
4. Log actual hours spent
5. Add comments

## 📊 Project Structure

```
epcentra-tracker/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskModal.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom hooks
│   │   └── useTasks.ts
│   ├── lib/              # Library configurations
│   │   └── firebase.ts
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Tasks.tsx
│   │   ├── Roadmap.tsx
│   │   ├── Team.tsx
│   │   └── Login.tsx
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🎨 Color Scheme (EPCENTRA Brand)

```css
Navy Blue: #1E3A5F
Teal: #2A8B8B
Gold: #D4A84B
Dark Navy: #152A45
Light Teal: #3AA5A5
Light Gold: #E8C878
Gray: #6B7280
Light Gray: #F5F7F9
```

## 🔐 User Roles

- **Admin**: Full access, can manage all tasks and users
- **Developer**: Can create and update tasks, track time
- **QA**: Can view and update task status, add comments
- **DevOps**: Can view and update infrastructure tasks
- **Viewer**: Read-only access to all data

## 📈 Key Metrics Tracked

- Total tasks by phase
- Completion percentage
- Tasks by status (Pending, In Progress, Completed, Blocked)
- Estimated vs actual hours
- Phase-wise progress
- Team workload distribution
- Recent activity

## 🚢 Deployment

### Deploy to Vercel

```bash
npm run build
vercel
```

### Deploy to Firebase Hosting

```bash
npm run build
firebase init hosting
firebase deploy
```

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Features

1. Create types in `src/types/index.ts`
2. Add Firebase hooks in `src/hooks/`
3. Create components in `src/components/`
4. Add pages in `src/pages/`
5. Update routing in `src/App.tsx`

## 🐛 Troubleshooting

### Firebase Connection Issues

- Check if Firebase config is correct in `src/lib/firebase.ts`
- Ensure Firestore is enabled in Firebase Console
- Verify security rules are set correctly

### Authentication Issues

- Clear browser cache and cookies
- Check if Email/Password auth is enabled
- Verify password meets minimum length (6 chars)

### Build Issues

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📝 License

This project is private and proprietary to EPCENTRA development.

## 🤝 Contributing

This is an internal tool for EPCENTRA development team.

## 📞 Support

For issues or questions, contact:
- **Email**: dev@epcentra.com
- **Slack**: #epcentra-tracker

---

**EPCENTRA** — *Engineered for Execution*

Last Updated: December 2025
