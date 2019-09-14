const admin = require('firebase-admin');
const firebase = require('firebase');
const firebaseConfig = {
  apiKey: "AIzaSyCsxomL9F-mM5VIaSKQK3XwRVJA5S4ApwY",
  authDomain: "socialapp-6d585.firebaseapp.com",
  databaseURL: "https://socialapp-6d585.firebaseio.com",
  projectId: "socialapp-6d585",
  storageBucket: "socialapp-6d585.appspot.com",
  messagingSenderId: "548811696407",
  appId: "1:548811696407:web:e4547a7d673755f110ef52"
};
firebase.initializeApp(firebaseConfig);
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://socialapp-6d585.firebaseio.com"
});

const db = admin.firestore();

module.exports = {admin, db, firebase, firebaseConfig}
