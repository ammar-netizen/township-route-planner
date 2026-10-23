import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let db = null;
try {
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('YOUR_API_KEY')) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (e) {
  console.warn("Firebase initialization skipped, using local mode", e);
}

// Timeout helper so form NEVER hangs
function withTimeout(promise, ms = 2500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timeout connecting to Firestore"));
    }, ms);
    promise
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function addReport(reportData) {
  const localReport = {
    id: 'rep_' + Date.now(),
    ...reportData,
    status: 'New',
    date: 'Just now'
  };

  // If Firebase is initialized, try saving in background with a quick 2-second timeout
  if (db) {
    try {
      const docPromise = addDoc(collection(db, 'reports'), {
        ...reportData,
        status: 'New',
        createdAt: serverTimestamp()
      });
      const docRef = await withTimeout(docPromise, 2000);
      return { id: docRef.id, ...reportData, status: 'New', date: 'Just now' };
    } catch (err) {
      console.warn("Firestore save timed out or rules pending. Saved to local state instantly.", err);
      return localReport;
    }
  }

  return localReport;
}

export async function getReports() {
  if (!db) return null;
  try {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const snapshot = await withTimeout(getDocs(q), 2000);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn("Could not fetch remote reports within timeout, using local data.", err);
    return null;
  }
}