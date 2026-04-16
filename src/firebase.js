import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendEmailVerification, 
    onAuthStateChanged, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInAnonymously 
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    serverTimestamp 
} from "firebase/firestore";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const appId = import.meta.env.VITE_APP_ARTIFACT_ID || 'ceylon-voyage-v8';

let app, auth, db, storage, functions;
const configAvailable = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'demo-key';

if (configAvailable) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);
} else {
    if (document.body) {
        document.body.classList.add('no-config');
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.classList.add('no-config');
        });
    }
}

export { 
    app, auth, db, storage, functions, configAvailable, appId,
    signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, 
    onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInAnonymously,
    collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp,
    ref, uploadBytes, getDownloadURL,
    httpsCallable
};
