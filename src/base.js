// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { GoogleAuthProvider } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// function getCustomAuth() {
//   const auth = getAuth();
//   connectAuthEmulator(auth, "127.0.0.1:9099");
//   return auth;
// };

function getCustomAuth() {
  const auth = getAuth();

  connectAuthEmulator(auth, "http://127.0.0.1:9099/", {
    disableWarnings: true,
  });

  return auth;
}

function getCustomFirestore() {
  const db = getFirestore();
  connectFirestoreEmulator(db, "localhost", 8081);

  // Create users collection
  const usersCollection = collection(db, "users");
  const addUser = async (userId, email, firstname, lastname, admin_status) => {
    await setDoc(doc(usersCollection, userId), {
      email,
      firstname,
      lastname,
      admin_status,
    });
  };

  const getAdminStatus = async (userId) => {
    const userDoc = doc(usersCollection, userId);
    const userSnap = await getDoc(userDoc);
    if (userSnap.exists()) {
      return userSnap.data().admin_status;
    } else {
      return 0;
    }
  };

  // Create requests collection
  const requestsCollection = collection(db, "requests");
  const addRequest = async (user_id, request_data, status, admin_ids) => {
    const doc = await addDoc(requestsCollection, {
      user_id,
      request_data,
      status,
      admin_ids,
    });
    return doc.id;
  };
  const getRequest = async (requestId) => {
    // dont use requestsCollection
    const docRef = doc(db, "requests", requestId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  };

  // querys all requests made by userid
  const getRequestsByUser = async (userId) => {
    const querySnapshot = await getDocs(
      query(requestsCollection, where("user_id", "==", userId))
    );
    return querySnapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
  };

  // Return an object containing the required collections and documents
  return {
    db,
    usersCollection,
    addUser,
    getAdminStatus,
    requestsCollection,
    addRequest,
    getRequest,
    getRequestsByUser,
  };
}

function getCustomDb() {
  const db = getDatabase();
  if (window.location.hostname === "localhost") {
    // Point to the RTDB emulator running on localhost.
    connectDatabaseEmulator(db, "localhost", 9000);
  }
  return db;
}

const firebaseConfig = {
  apiKey: "AIzaSyCP_dzafEk6y0dHK1ZtNUBwqlI2-Xfl-SY",
  authDomain: "platforms-for-progress.firebaseapp.com",
  databaseURL: "https://platforms-for-progress-default-rtdb.firebaseio.com",
  projectId: "platforms-for-progress",
  storageBucket: "platforms-for-progress.appspot.com",
  messagingSenderId: "108726206780",
  appId: "1:108726206780:web:13261fa1a58624801a5e39",
  measurementId: "G-Q341QLSYR4",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
// export const auth = getCustomAuth();

// export const db = getDatabase(app);
export const db = getCustomDb();

// export const firestore = getFirestore(app);
export const firestore = getCustomFirestore();

export const storage = getStorage(app);
const analytics = getAnalytics(app);

// export const uid = getUser();
// export const auth = firebase.auth();

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const signInWithGoogle = () => auth.signInWithPopup(provider);
