// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBL9IFVyedWF83e_v_EkJmljKOaCT0gULU',
  authDomain: 'khoaluantotnghiep-f279c.firebaseapp.com',
  projectId: 'khoaluantotnghiep-f279c',
  storageBucket: 'khoaluantotnghiep-f279c.firebasestorage.app',
  messagingSenderId: '737063541193',
  appId: '1:737063541193:web:6bd92426b46e250bc73018',
  measurementId: 'G-EVR86CCLEN',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
