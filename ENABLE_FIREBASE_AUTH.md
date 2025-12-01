# Enable Firebase Authentication for EPCENTRA

## ✅ Code Changes Complete
The application code has been updated to support:
- ✅ Email/Password authentication
- ✅ Google Sign-In

## 🔧 Firebase Console Setup Required

To enable these authentication methods, follow these steps:

### 1. Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **EPCENTRA** project
3. Click on **Authentication** in the left sidebar
4. Click on **Get Started** (if first time) or go to the **Sign-in method** tab
5. Click on **Email/Password** in the provider list
6. Toggle **Enable** to ON
7. Click **Save**

### 2. Enable Google Authentication

1. In the same **Sign-in method** tab
2. Click on **Google** in the provider list
3. Toggle **Enable** to ON
4. Select a **Project support email** (your email address)
5. Click **Save**

### 3. Set Up Authorized Domains (for Production)

1. Still in **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. By default, `localhost` is already authorized for development
4. When deploying to production, add your production domain here

## 🚀 Testing the Authentication

### Test Email/Password Authentication:

1. Start the dev server (if not already running):
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/login

3. Click on **Sign Up** tab

4. Fill in the form:
   - Display Name: Your Name
   - Email: your-email@example.com
   - Password: (at least 6 characters)
   - Role: Select a role
   - Click **Sign Up**

5. After successful signup, you'll be redirected to the dashboard

6. Test login by logging out and logging back in with the same credentials

### Test Google Sign-In:

1. On the login page, click the **"Sign in with Google"** or **"Sign up with Google"** button

2. A popup will appear asking you to select your Google account

3. After successful authentication, you'll be redirected to the dashboard

4. Your user profile will be automatically created in Firestore with:
   - Email from Google
   - Display name from Google
   - Default role: "developer"

## 📝 User Data Structure

When users authenticate, their data is stored in Firestore under the `users` collection:

```typescript
{
  id: string;              // Firebase Auth UID
  email: string;           // User's email
  displayName: string;     // User's display name
  role: 'admin' | 'developer' | 'qa' | 'devops' | 'viewer';
  createdAt: Date;         // Account creation timestamp
}
```

## 🔐 Security Considerations

1. **Firestore Security Rules**: Make sure to set up proper security rules for your Firestore database

2. **Password Requirements**: Currently set to minimum 6 characters (Firebase default)

3. **Email Verification**: You can enable email verification in Firebase Console → Authentication → Templates

4. **Role Management**: Google sign-in users default to "developer" role. You may want to implement an admin panel to change user roles

## 🎉 Features Included

- ✅ Email/Password signup and login
- ✅ Google OAuth sign-in
- ✅ Automatic user profile creation
- ✅ Role-based access (foundation ready)
- ✅ Persistent authentication state
- ✅ Secure logout functionality

## 🔄 Next Steps

1. Enable the authentication methods in Firebase Console (steps above)
2. Test both authentication methods
3. Consider adding:
   - Email verification
   - Password reset functionality
   - Profile update functionality
   - Admin panel for user management

## ⚠️ Important Notes

- Make sure you've enabled **Firestore Database** in your Firebase project
- The app uses Firestore to store user profiles separate from Firebase Auth
- Google sign-in works only on authorized domains (localhost is pre-authorized)
- For production, make sure to add your production domain to authorized domains
