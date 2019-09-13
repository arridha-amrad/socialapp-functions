const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express')
const app = express();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://socialapp-6d585.firebaseio.com"
});

app.get('/scream', (req, res) => {
  admin.firestore().collection('screams').orderBy('createdAt', "desc").get()
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
  admin.firestore().collection('screams').add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` })
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" })
      console.error(err);
    })
})

exports.api = functions.region('asia-northeast1').https.onRequest(app);