import {initializeApp, getApp, getApps, FirebaseApp} from 'firebase/app';
import {getFirestore, Firestore} from 'firebase/firestore';
import {getAuth, Auth} from 'firebase/auth';
import {firebaseConfig} from './config';

export function initializeFirebase(): {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  return {app, firestore, auth};
}

export * from './provider';
export {useCollection} from './firestore/use-collection';
export {useDoc} from './firestore/use-doc';
export {useUser} from './auth/use-user';
