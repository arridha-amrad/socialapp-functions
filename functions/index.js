const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
const firebase = require('firebase');
const { isEmail, isEmpty } = require('./Helpers');
// export GOOGLE_APPLICATION_CREDENTIALS="/Users/macbookpromd103/Documents/googleCloudService/file.json"
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

app.get('/scream', (req, res) => {
  db.collection('screams').orderBy('createdAt', "desc").get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          userHandle: doc.data().userHandle,
          body: doc.data().body,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(screams)
    })
    .catch(err => console.error(err))
})

app.post('/scream', (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Request method not allowed" })
  }
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };
  db.collection('screams').add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` })
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" })
      console.error(err);
    })
})

// Signup Route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  let errors = {};
  if (isEmpty(newUser.email)) {
    errors.email = "Email must not be empty"
  } else if (!isEmail(newUser.email)) {
    errors.email = "Please enter your valid email"
  }
  if (isEmpty(newUser.password))
    errors.password = "Password must not be empty"
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Your password not match"
  if (isEmpty(newUser.handle))
    errors.handle = "Handle must not be empty"

  if (Object.keys(errors).length > 0)
    return res.status(400).json(errors);

  // TODO: VALIDATE DATA
  let token, userId;
  db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
      if (doc.exist) {
        return res.status(400).json({ error: "This handle has been taken" });
      } else {
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken()
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(200).json({ token })
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ error: "This email has been registered" })
      } else {
        return res.status(500).json({ error: err.code })
      }
    })
})

// Login Route
app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }
  let errors = {};
  if (isEmpty(user.email)) errors.email = "Email must not be empty"
  if (isEmpty(user.password)) errors.password = "Password must not be empty"

  if (Object.keys(errors).length > 0) return res.status(400).json(errors)

  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token })
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        return res.status(400).json({ error: "Email and Password don't match" })
      } else {
        return res.status(500).json({ error: err.code })
      }
    })
})

exports.api = functions.region('asia-northeast1').https.onRequest(app);