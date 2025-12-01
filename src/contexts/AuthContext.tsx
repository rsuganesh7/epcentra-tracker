import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, displayName: string, role: User['role']) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email: string, password: string, displayName: string, role: User['role']) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    const user: User = {
      id: userCredential.user.uid,
      email,
      displayName,
      role,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.id), user);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Check if user document exists, if not create one
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) {
      const user: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: userCredential.user.displayName || 'User',
        role: 'developer', // Default role for Google sign-in users
        createdAt: new Date()
      };
      await setDoc(doc(db, 'users', user.id), user);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setCurrentUser(userDoc.data() as User);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    login,
    loginWithGoogle,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
