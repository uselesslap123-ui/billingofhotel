'use client';
import {createContext, useContext, ReactNode} from 'react';
import {FirebaseApp} from 'firebase/app';
import {Firestore} from 'firebase/firestore';
import {Auth} from 'firebase/auth';

export type FirebaseContextValue = {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
};

export const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const useFirebase = (): FirebaseContextValue => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = (): FirebaseApp | null => {
  return useFirebase().app;
};

export const useFirestore = (): Firestore | null => {
  return useFirebase().firestore;
};

export const useAuth = (): Auth | null => {
  return useFirebase().auth;
};
