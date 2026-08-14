import {initializeApp,getApps} from 'firebase/app';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut} from 'firebase/auth';

const firebaseConfig={
  apiKey:           import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:       import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:        import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:            import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseReady=Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

const app=firebaseReady
  ? (getApps().length===0?initializeApp(firebaseConfig):getApps()[0])
  : null;

export const auth=app?getAuth(app):null;

const googleProvider=new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export async function signInWithGoogle(){
  if(!auth){
    throw new Error('Firebase environment variables are not configured.');
  }
  const result=await signInWithPopup(auth,googleProvider);
  return result.user;
}
export async function signOutUser(){
  if(auth) await signOut(auth);
}
export default app;
