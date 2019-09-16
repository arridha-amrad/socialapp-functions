// export GOOGLE_APPLICATION_CREDENTIALS="/Users/macbookpromd103/Documents/googleCloudService/file.json"
const functions = require('firebase-functions');
const app = require('express')();
const Auth = require('./middleware/Auth');
const { getAllScreams, createNewScream, getScream, commentOnScream, likeScream, unlikeScream, deleteScream } = require('./handlers/Scream');
const { Signup, Signin, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationsRead } = require('./handlers/User');
const { db } = require('./utils/Admin');

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

// Triggers
exports.createNotificationOnLike = functions.region('asia-northeast1').firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    return db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
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
        if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
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

exports.onUserImageChange = functions.region('asia-northeast1').firestore.document('/users/{userId}')
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    // only run if user chnage their image profile
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("image has changed");
      let batch = db.batch();
      return db
        .collection('screams')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const scream = db.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: change.after.data().imageUrl });
          })
          return batch.commit();
        })
    } else return true;
  })

exports.onScreamDelete = functions
  .region('asia-northeast1')
  .firestore.document('/screams/{screamId}')
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db
      .collection('comments')
      .where('screamId', '==', screamId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        })
        return db.collection('likes').where('screamId', '==', screamId).get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`))
        })
        return db.collection('notification').where('screamId', '==', screamId).get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notification/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => console.error(err));
  });