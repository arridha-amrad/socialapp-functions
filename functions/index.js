const functions = require('firebase-functions');
const admin = require('firebase-admin');

const serviceAccount = require("./file.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://socialapp-6d585.firebaseio.com"
});

// var config = {
//   apiKey: "key",
//   authDomain: "app.firebaseapp.com",
//   databaseURL: "https://app.firebaseio.com",
//   projectId: "appID",
//   storageBucket: "app.appspot.com",
//   messagingSenderId: "number"
// };
// firebase.initializeApp(config);
// admin.initializeApp(functions.config().firebase);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

exports.getScreams = functions.https.onRequest((req, res) => {
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
