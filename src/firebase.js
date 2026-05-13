import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBo-GTS7roIGmOXWF70Y8TeWhfCAqBOqdk",
  authDomain: "futebol-estrelas-47490.firebaseapp.com",
  databaseURL: "https://futebol-estrelas-47490-default-rtdb.firebaseio.com",
  projectId: "futebol-estrelas-47490",
  storageBucket: "futebol-estrelas-47490.firebasestorage.app",
  messagingSenderId: "200217091797",
  appId: "1:200217091797:web:a8c812b9bedb2d92004c5c"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
