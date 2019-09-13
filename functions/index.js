const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express')
const app = express();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://socialapp-6d585.firebaseio.com"
});

app.get('/screams', (req, res) => {
  admin.firestore().collection('screams').get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push(doc.data());
      });
      return res.json(screams)
    })
    .catch(err => console.error(err))
})

// exports.getScreams = functions.https.onRequest((req, res) => {
//   admin.firestore().collection('screams').get()
//     .then(data => {
//       let screams = [];
//       data.forEach(doc => {
//         screams.push(doc.data());
//       });
//       return res.json(screams)
//     })
//     .catch(err => console.error(err))
// })

exports.newScreams = functions.https.onRequest((req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Request method not allowed" })
  }
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
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

exports.api = functions.https.onRequest(app);