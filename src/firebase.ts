// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// add realtime database:``

import { Database, getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCbGiDcgE1A9T2tDmnUSb_I86lKQ_p-vE",
  authDomain: "hyperlearn-27e61.firebaseapp.com",
  projectId: "hyperlearn-27e61",
  storageBucket: "hyperlearn-27e61.firebasestorage.app",
  messagingSenderId: "360734666516",
  appId: "1:360734666516:web:69f29ff8ca30b9fb005c01",
  databaseURL: "https://hyperlearn-27e61-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const realtimedb: Database = getDatabase(app);
export { realtimedb };