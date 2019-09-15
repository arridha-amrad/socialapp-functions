// export GOOGLE_APPLICATION_CREDENTIALS="/Users/macbookpromd103/Documents/googleCloudService/file.json"
const functions = require('firebase-functions');
const app = require('express')();
const Auth = require('./middleware/Auth');
const { getAllScreams, createNewScream, getScream, commentOnScream, likeScream, unlikeScream, deleteScream } = require('./handlers/Scream');
const { Signup, Signin, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationsRead } = require('./handlers/User');
const {db} = require('./utils/Admin');

app.get('/scream', getAllScreams);
app.post('/scream', Auth, createNewScream);
app.get('/scream/:screamId', getScream);
app.post('/scream/:screamId/comment', Auth, commentOnScream);
app.get('/scream/:screamId/like', Auth, likeScream);
app.get('/scream/:screamId/unlike', Auth, unlikeScream);
app.delete('/scream/:screamId', Auth, deleteScream);
// DELETE like, unlike, comment

app.post('/signup', Signup);
app.post('/login', Signin);
app.post('/user/image', Auth, uploadImage);
app.post('/user', Auth, addUserDetails);
app.get('/user', Auth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);
app.post('/notifications', Auth, markNotificationsRead)

exports.api = functions.region('asia-northeast1').https.onRequest(app);

exports.createNotificationOnLike = functions.region('asia-northeast1').firestore.document('likes/{id}')
.onCreate((snapshot) => {
  return db.doc(`/screams/${snapshot.data().screamId}`)
  .get()
  .then(doc => {
    if(doc.exists) {
      return db.doc(`/notification/${snapshot.id}`).set({
        createdAt: new Date().toISOString(),
        recipient: doc.data().userHandle,
        sender: snapshot.data().userHandle,
        type: 'like',
        read: false,
        screamId: doc.id
      });
    }
  })
  .catch(err => console.error(err))
})

exports.deleteNotificationOnUnlike = functions.region('asia-northeast1').firestore.document('likes/{id}')
.onDelete(snapshot => {
  return db.doc(`notification/${snapshot.id}`)
    .delete()
    .catch(err => {
      console.error(err)
      return;
    });
});

exports.createNotificationOnComment = functions.region('asia-northeast1').firestore.document('comments/{id}')
.onCreate((snapshot) => {
  return db.doc(`/screams/${snapshot.data().screamId}`)
  .get()
  .then(doc => {
    if(doc.exists) {
      return db.doc(`/notification/${snapshot.id}`).set({
        createdAt: new Date().toISOString(),
        recipient: doc.data().userHandle,
        sender: snapshot.data().userHandle,
        type: 'comment',
        read: false,
        screamId: doc.id
      });
    }
  })
  .catch(err => console.error(err))
})