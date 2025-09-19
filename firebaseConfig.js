
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLEvW4Xgc0jNCt-byr499xeB4rU88Bg4M",
  authDomain: "learnloop-cc2ba.firebaseapp.com",
  projectId: "learnloop-cc2ba",
  storageBucket: "learnloop-cc2ba.firebasestorage.app",
  messagingSenderId: "295858660387",
  appId: "1:295858660387:web:ab792767a251e159663d96"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const auth = getAuth(app)
