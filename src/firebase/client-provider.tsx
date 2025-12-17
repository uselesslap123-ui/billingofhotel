'use client';

import {ReactNode, useMemo} from 'react';
import {initializeFirebase} from './index';
import {FirebaseContext, FirebaseContextValue} from './provider';

export function FirebaseProvider({children}: {children: ReactNode}) {
  const firebaseContextValue: FirebaseContextValue = useMemo(() => {
    const {app, firestore, auth} = initializeFirebase();
    return {app, firestore, auth};
  }, []);

  return (
    <FirebaseContext.Provider value={firebaseContextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}
