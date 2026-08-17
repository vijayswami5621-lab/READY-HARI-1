/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { UserProfile, Address } from './db';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile as firebaseUpdateProfile, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { runFirebaseWithRetry } from './error';

export type { Address };

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<UserProfile>;
  register: (data: Omit<UserProfile, 'uid' | 'role' | 'createdAt' | 'updatedAt' | 'lastLogin' | 'accountStatus' | 'addresses'> & { password?: string }) => Promise<UserProfile>;
  googleSignIn: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'uid' | 'role' | 'createdAt' | 'updatedAt' | 'addresses'>>) => Promise<UserProfile>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  // Address Book APIs
  addAddress: (address: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }) => Promise<Address>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen to Firebase Auth changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await runFirebaseWithRetry(() => getDoc(userDocRef));
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            setCurrentUser(profile);
            localStorage.setItem('hari_pathshala_current_user', JSON.stringify(profile));
          } else {
            const nowStr = new Date().toISOString();
            const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
            const defaultProfile: UserProfile = {
              uid: firebaseUser.uid,
              fullName: firebaseUser.displayName || displayName,
              displayName: displayName,
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
              role: (firebaseUser.email?.toLowerCase() === 'admin@haripathshala.com' || firebaseUser.email?.toLowerCase() === 'vijayswami5621@gmail.com') ? 'admin' : 'user',
              createdAt: nowStr,
              updatedAt: nowStr,
              lastLogin: nowStr,
              accountStatus: 'active',
              addresses: []
            };
            try {
              await runFirebaseWithRetry(() => setDoc(userDocRef, defaultProfile));
            } catch (writeErr) {
              console.warn('Firestore fallback on write:', writeErr);
            }
            setCurrentUser(defaultProfile);
            localStorage.setItem('hari_pathshala_current_user', JSON.stringify(defaultProfile));
          }
        } catch (err) {
          console.warn('Error fetching user profile from Firestore, using fallback:', err);
          const storedUser = localStorage.getItem('hari_pathshala_current_user');
          if (storedUser) {
            try {
              setCurrentUser(JSON.parse(storedUser));
            } catch (parseErr) {
              console.error(parseErr);
            }
          } else {
            const nowStr = new Date().toISOString();
            const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
            const fallbackProfile: UserProfile = {
              uid: firebaseUser.uid,
              fullName: firebaseUser.displayName || displayName,
              displayName: displayName,
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
              role: (firebaseUser.email?.toLowerCase() === 'admin@haripathshala.com' || firebaseUser.email?.toLowerCase() === 'vijayswami5621@gmail.com') ? 'admin' : 'user',
              createdAt: nowStr,
              updatedAt: nowStr,
              lastLogin: nowStr,
              accountStatus: 'active',
              addresses: []
            };
            setCurrentUser(fallbackProfile);
            localStorage.setItem('hari_pathshala_current_user', JSON.stringify(fallbackProfile));
          }
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('hari_pathshala_current_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, rememberMe = true): Promise<UserProfile> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      let profile: UserProfile;
      const nowStr = new Date().toISOString();

      try {
        const userDoc = await runFirebaseWithRetry(() => getDoc(userDocRef));
        if (userDoc.exists()) {
          profile = userDoc.data() as UserProfile;
          profile.lastLogin = nowStr;
          await runFirebaseWithRetry(() => updateDoc(userDocRef, { lastLogin: nowStr }));
        } else {
          const displayName = firebaseUser.displayName || email.split('@')[0] || 'User';
          profile = {
            uid: firebaseUser.uid,
            fullName: firebaseUser.displayName || displayName,
            displayName: displayName,
            email: email,
            photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
            role: (email.toLowerCase() === 'admin@haripathshala.com' || email.toLowerCase() === 'vijayswami5621@gmail.com') ? 'admin' : 'user',
            createdAt: nowStr,
            updatedAt: nowStr,
            lastLogin: nowStr,
            accountStatus: 'active',
            addresses: []
          };
          await runFirebaseWithRetry(() => setDoc(userDocRef, profile));
        }
      } catch (firestoreErr) {
        console.warn('Firestore fetch failed during login, using client fallback:', firestoreErr);
        const displayName = firebaseUser.displayName || email.split('@')[0] || 'User';
        profile = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || displayName,
          displayName: displayName,
          email: email,
          photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
          role: (email.toLowerCase() === 'admin@haripathshala.com' || email.toLowerCase() === 'vijayswami5621@gmail.com') ? 'admin' : 'user',
          createdAt: nowStr,
          updatedAt: nowStr,
          lastLogin: nowStr,
          accountStatus: 'active',
          addresses: []
        };
      }

      setCurrentUser(profile);
      localStorage.setItem('hari_pathshala_current_user', JSON.stringify(profile));
      setLoading(false);
      return profile;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (data: Omit<UserProfile, 'uid' | 'role' | 'createdAt' | 'updatedAt' | 'lastLogin' | 'accountStatus' | 'addresses'> & { password?: string }): Promise<UserProfile> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password || 'password');
      const firebaseUser = userCredential.user;

      await firebaseUpdateProfile(firebaseUser, {
        displayName: data.displayName || data.fullName.split(' ')[0],
        photoURL: data.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'
      });

      const nowStr = new Date().toISOString();
      const isFirstUserOrAdmin = data.email.toLowerCase() === 'admin@haripathshala.com' || data.email.toLowerCase() === 'vijayswami5621@gmail.com';

      const newUserProfile: UserProfile = {
        uid: firebaseUser.uid,
        fullName: data.fullName,
        displayName: data.displayName || data.fullName.split(' ')[0],
        email: data.email,
        mobile: data.mobile,
        photoURL: data.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
        role: isFirstUserOrAdmin ? 'admin' : 'user',
        createdAt: nowStr,
        updatedAt: nowStr,
        lastLogin: nowStr,
        accountStatus: 'active',
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        addresses: []
      };

      try {
        await runFirebaseWithRetry(() => setDoc(doc(db, 'users', firebaseUser.uid), newUserProfile));
      } catch (firestoreErr) {
        console.warn('Firestore write failed during registration, using client fallback:', firestoreErr);
      }
      
      setCurrentUser(newUserProfile);
      localStorage.setItem('hari_pathshala_current_user', JSON.stringify(newUserProfile));
      
      setLoading(false);
      return newUserProfile;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  };

  const googleSignIn = async (): Promise<UserProfile> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      let profile: UserProfile;
      const nowStr = new Date().toISOString();

      try {
        const userDoc = await runFirebaseWithRetry(() => getDoc(userDocRef));
        if (userDoc.exists()) {
          profile = userDoc.data() as UserProfile;
          profile.lastLogin = nowStr;
          await runFirebaseWithRetry(() => updateDoc(userDocRef, { lastLogin: nowStr }));
        } else {
          const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
          profile = {
            uid: firebaseUser.uid,
            fullName: firebaseUser.displayName || displayName,
            displayName: displayName,
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
            role: (firebaseUser.email?.toLowerCase() === 'admin@haripathshala.com' || firebaseUser.email?.toLowerCase() === 'vijayswami5621@gmail.com') ? 'admin' : 'user',
            createdAt: nowStr,
            updatedAt: nowStr,
            lastLogin: nowStr,
            accountStatus: 'active',
            addresses: []
          };
          await runFirebaseWithRetry(() => setDoc(userDocRef, profile));
        }
      } catch (firestoreErr) {
        console.warn('Firestore fetch failed during googleSignIn, using client fallback:', firestoreErr);
        const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
        profile = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || displayName,
          displayName: displayName,
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
          role: (firebaseUser.email?.toLowerCase() === 'admin@haripathshala.com' || firebaseUser.email?.toLowerCase() === 'vijayswami5621@gmail.com') ? 'admin' : 'user',
          createdAt: nowStr,
          updatedAt: nowStr,
          lastLogin: nowStr,
          accountStatus: 'active',
          addresses: []
        };
      }

      setCurrentUser(profile);
      localStorage.setItem('hari_pathshala_current_user', JSON.stringify(profile));
      setLoading(false);
      return profile;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('hari_pathshala_current_user');
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'uid' | 'role' | 'createdAt' | 'updatedAt' | 'addresses'>>): Promise<UserProfile> => {
    if (!currentUser) throw new Error('No user is currently logged in.');

    setLoading(true);
    try {
      const nowStr = new Date().toISOString();
      const updated: UserProfile = {
        ...currentUser,
        ...updates,
        updatedAt: nowStr
      };

      if (auth.currentUser && (updates.displayName || updates.photoURL)) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: updates.displayName || auth.currentUser.displayName,
          photoURL: updates.photoURL || auth.currentUser.photoURL
        });
      }

      await runFirebaseWithRetry(() => setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true }));
      setCurrentUser(updated);
      localStorage.setItem('hari_pathshala_current_user', JSON.stringify(updated));
      setLoading(false);
      return updated;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      throw err;
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<void> => {
    throw new Error('Please use the reset password link sent to your email.');
  };

  // Address Management
  const addAddress = async (address: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }): Promise<Address> => {
    if (!currentUser) throw new Error('Must be logged in to manage addresses.');

    const newAddress: Address = {
      ...address,
      id: `addr-${Date.now()}`,
      isDefault: address.isDefault || currentUser.addresses.length === 0
    };

    let updatedAddresses = [...currentUser.addresses];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(newAddress);

    const updatedUser = { ...currentUser, addresses: updatedAddresses, updatedAt: new Date().toISOString() };
    await runFirebaseWithRetry(() => setDoc(doc(db, 'users', currentUser.uid), updatedUser, { merge: true }));
    setCurrentUser(updatedUser);
    localStorage.setItem('hari_pathshala_current_user', JSON.stringify(updatedUser));

    return newAddress;
  };

  const updateAddress = async (id: string, updates: Partial<Address>): Promise<Address> => {
    if (!currentUser) throw new Error('Must be logged in to manage addresses.');

    let updatedAddresses = currentUser.addresses.map(a => {
      if (a.id === id) {
        return { ...a, ...updates };
      }
      return a;
    });

    if (updates.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({
        ...a,
        isDefault: a.id === id ? true : false
      }));
    }

    const updatedUser = { ...currentUser, addresses: updatedAddresses, updatedAt: new Date().toISOString() };
    await runFirebaseWithRetry(() => setDoc(doc(db, 'users', currentUser.uid), updatedUser, { merge: true }));
    setCurrentUser(updatedUser);
    localStorage.setItem('hari_pathshala_current_user', JSON.stringify(updatedUser));

    return updatedAddresses.find(a => a.id === id)!;
  };

  const deleteAddress = async (id: string): Promise<void> => {
    if (!currentUser) throw new Error('Must be logged in.');

    const filtered = currentUser.addresses.filter(a => a.id !== id);
    if (currentUser.addresses.find(a => a.id === id)?.isDefault && filtered.length > 0) {
      filtered[0].isDefault = true;
    }

    const updatedUser = { ...currentUser, addresses: filtered, updatedAt: new Date().toISOString() };
    await runFirebaseWithRetry(() => setDoc(doc(db, 'users', currentUser.uid), updatedUser, { merge: true }));
    setCurrentUser(updatedUser);
    localStorage.setItem('hari_pathshala_current_user', JSON.stringify(updatedUser));
  };

  const setDefaultAddress = async (id: string): Promise<void> => {
    if (!currentUser) throw new Error('Must be logged in.');

    const updated = currentUser.addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));

    const updatedUser = { ...currentUser, addresses: updated, updatedAt: new Date().toISOString() };
    await runFirebaseWithRetry(() => setDoc(doc(db, 'users', currentUser.uid), updatedUser, { merge: true }));
    setCurrentUser(updatedUser);
    localStorage.setItem('hari_pathshala_current_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      login,
      register,
      googleSignIn,
      logout,
      updateProfile,
      forgotPassword,
      resetPassword,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

