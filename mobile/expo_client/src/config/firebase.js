import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Swappable Firebase web client credentials.
// Align these keys with your Firebase project settings console.
const firebaseConfig = {
  apiKey: "AIzaSyFakeKey-ReplaceWithYourActualWebAPIKey",
  authDomain: "ai-service-orchestrator-agent.firebaseapp.com",
  projectId: "ai-service-orchestrator-agent",
  storageBucket: "ai-service-orchestrator-agent.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k"
};

// Initialize Firebase Application
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase Auth instance
export const auth = getAuth(app);
