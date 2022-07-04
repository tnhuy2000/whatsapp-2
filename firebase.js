
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDR41_ueLz4LjRRudKXtBwuwYYgSY4NC6Q",
    authDomain: "whatsapp-2-6a096.firebaseapp.com",
    projectId: "whatsapp-2-6a096",
    storageBucket: "whatsapp-2-6a096.appspot.com",
    messagingSenderId: "7161045717",
    appId: "1:7161045717:web:7509e8b1e710e5e91c385c"
  };

const app = !firebase.apps.length 
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app()

const db = app.firestore()
const auth = app.auth()
const provider = new firebase.auth.GoogleAuthProvider()

export {db, auth, provider}