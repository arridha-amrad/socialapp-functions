// export GOOGLE_APPLICATION_CREDENTIALS="/Users/macbookpromd103/Documents/googleCloudService/file.json"
const functions = require('firebase-functions');
const app = require('express')();
const Auth = require('./middleware/Auth');
const { getAllScreams, createNewScream } = require('./handlers/Scream');
const { Signup, Signin, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/User');

app.get('/scream', getAllScreams);
app.post('/scream', Auth, createNewScream);
app.post('/signup', Signup);
app.post('/login', Signin);
app.post('/user/image', Auth, uploadImage);
app.post('/user', Auth, addUserDetails);
app.get('/user', Auth, getAuthenticatedUser);

exports.api = functions.region('asia-northeast1').https.onRequest(app);