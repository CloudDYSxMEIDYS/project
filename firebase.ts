// firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB6u2k6I9fbtdmaeghIOYFgV6fI2unGB9o",
  authDomain: "focus-8ddca.firebaseapp.com",
  projectId: "focus-8ddca",
  storageBucket: "focus-8ddca.firebasestorage.app",
  messagingSenderId: "301800528546",
  appId: "1:301800528546:web:eedfcc70ac76907d7d55fb",
  measurementId: "G-SHHE8G9Z86"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
