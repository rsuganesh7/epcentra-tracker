# Fix Firestore Permissions Error - EPCENTRA

## ✅ Error Debugging Enabled

The application now has comprehensive error handling:
- ✅ Error states in useTasks hook
- ✅ Error messages displayed in Dashboard
- ✅ Error messages displayed in Tasks page
- ✅ Console logging for all operations
- ✅ Detailed error messages with troubleshooting tips

## 🔧 Fix "Missing or Insufficient Permissions" Error

This error occurs because Firestore security rules need to be configured. Here are TWO ways to fix it:

### Method 1: Deploy Rules via Command Line (Recommended)

1. Make sure you're in the project directory:
   ```bash
   cd "/Users/suganeshr/My Projects/EPCENTRA/Project Tracker/epcentra-tracker"
   ```

2. Deploy the Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. Wait for the deployment to complete (should take 10-30 seconds)

4. Refresh your browser

### Method 2: Configure Rules Manually in Firebase Console

If the command line method doesn't work, use the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)

2. Select your **EPCENTRA** project

3. Click on **Firestore Database** in the left sidebar

4. Click on the **Rules** tab

5. Replace the existing rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Helper function to get user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow delete: if isAdmin();
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated() && (isAdmin() || resource.data.createdBy == request.auth.uid);
      
      // Comments subcollection
      match /comments/{commentId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
        allow delete: if isAuthenticated() && (isAdmin() || resource.data.userId == request.auth.uid);
      }
      
      // Time entries subcollection
      match /timeEntries/{entryId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
        allow delete: if isAuthenticated() && (isAdmin() || resource.data.userId == request.auth.uid);
      }
    }
    
    // Activities collection
    match /activities/{activityId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Phases collection
    match /phases/{phaseId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

6. Click **Publish**

7. Refresh your browser

## 🔍 Verify the Fix

After deploying the rules:

1. Open your browser console (F12 or right-click → Inspect → Console tab)

2. Refresh the page (http://localhost:3000)

3. You should see console logs like:
   - "Task created successfully: [task-id]"
   - "Task updated successfully: [task-id]"

4. If you still see errors, check:
   - You're logged in (check the top right corner)
   - The rules were published successfully
   - Your internet connection is working

## 🐛 Debugging Tips

### View Console Logs:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages or success logs
4. Red text = errors
5. Blue/Black text = info/success

### Common Errors:

1. **"Missing or insufficient permissions"**
   - Solution: Deploy Firestore rules (see above)

2. **"Network request failed"**
   - Solution: Check your internet connection
   - Make sure you're logged in

3. **"User not authenticated"**
   - Solution: Log out and log back in
   - Clear browser cache if needed

4. **"Collection/Document not found"**
   - Solution: This is normal if no data exists yet
   - Try creating a task to initialize the collection

## 📊 What the Rules Allow:

✅ **Authenticated users can:**
- Read all users
- Read/create/update/delete their own tasks
- Read/create/update/delete task comments they created
- Read/create/update/delete their own time entries
- Read/write activities

✅ **Admins can:**
- Everything above, plus:
- Update any user's profile
- Delete any user
- Delete any task
- Manage phases

❌ **Unauthenticated users:**
- Cannot access any data
- Must log in first

## 🎯 Next Steps

1. Deploy the Firestore rules
2. Log in to the application
3. Try creating a task
4. Check browser console for success messages
5. If you see errors, check this guide

## 📝 Files Created/Updated

- ✅ `firestore.rules` - Security rules for Firestore
- ✅ `firestore.indexes.json` - Index configuration
- ✅ `firebase.json` - Firebase project configuration
- ✅ `.firebaserc` - Firebase project alias
- ✅ `src/hooks/useTasks.ts` - Added error handling
- ✅ `src/pages/Dashboard.tsx` - Added error display
- ✅ `src/pages/Tasks.tsx` - Added error display

## 🚀 Deploy Rules Now

Run this command:
```bash
cd "/Users/suganeshr/My Projects/EPCENTRA/Project Tracker/epcentra-tracker" && firebase deploy --only firestore:rules
```

Wait for "✔ Deploy complete!" message, then refresh your browser.
