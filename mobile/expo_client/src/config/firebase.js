import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';

// Swappable Firebase web client credentials.
// Align these keys with your Firebase project settings console.
const firebaseConfig = {
  apiKey: "AIzaSyBIrOcMIh83YRJbY7tqwr3HH-lGVunyfqQ",
  authDomain: "hazir-ai-service-orchestrator.firebaseapp.com",
  projectId: "hazir-ai-service-orchestrator",
  storageBucket: "hazir-ai-service-orchestrator.firebasestorage.app",
  messagingSenderId: "370442150710",
  appId: "1:370442150710:web:c97273928fddf29a7ac997",
  measurementId: "G-PC8NCN3NLY"
};

// Initialize Firebase Application
const app = initializeApp(firebaseConfig);

// Platform-agnostic Auth Initialization (Persists session correctly on Mobile devices)
// We cache the initialized auth instance globally to prevent the 'auth/already-initialized' error during Fast Refreshes.
let tempAuth = global.firebase_auth || null;

if (!tempAuth) {
  if (Platform.OS === 'web') {
    tempAuth = getAuth(app);
  } else {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      tempAuth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    } catch (error) {
      // If it throws auth/already-initialized, we fall back to retrieving the active instance
      if (error.code === 'auth/already-initialized') {
        tempAuth = getAuth(app);
      } else {
        console.warn('[Firebase Config] Failed to initialize AsyncStorage persistence, defaulting to memory persistence.', error);
        tempAuth = getAuth(app);
      }
    }
  }
  global.firebase_auth = tempAuth;
}

export const auth = tempAuth;

import { getFirestore } from 'firebase/firestore';
export const db = getFirestore(app);
