import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace these with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDYJmMsFyvF5BNF2oS_y1vv38k1qvjkKXA",
  authDomain: "epcentra.firebaseapp.com",
  projectId: "epcentra",
  // Default Firebase storage bucket format
  storageBucket: "epcentra.appspot.com",
  messagingSenderId: "253146191168",
  appId: "1:253146191168:web:03999df61f71d86f5916a5",
  measurementId: "G-KMNFNC67XD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
