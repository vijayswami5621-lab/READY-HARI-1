/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvewdpsrKpobu7fVaJAul3FXPWYrsS7WE",
  authDomain: "shri-ram-34b7b.firebaseapp.com",
  databaseURL: "https://shri-ram-34b7b-default-rtdb.firebaseio.com",
  projectId: "shri-ram-34b7b",
  storageBucket: "shri-ram-34b7b.firebasestorage.app",
  messagingSenderId: "72601396083",
  appId: "1:72601396083:web:6291107d58fe75401cdb06",
  measurementId: "G-2PPF35YKKH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Safe Analytics initialization
export let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
  console.warn("Analytics not supported or blocked in this environment:", err);
});
