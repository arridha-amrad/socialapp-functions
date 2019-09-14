const {db, firebase, admin, firebaseConfig} = require('../utils/Admin')
const {signupValidator, signinValidator, reduceUserDetails} = require('../utils/Validators');
const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

exports.Signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const {errors, valid} = signupValidator(newUser)
  if(!valid) return res.status(400).json(errors)

  const noImg = 'no-img.png'


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
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
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
}

exports.Signin = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }

  const {valid, errors} = signinValidator(user);
  if(!valid) return res.status(400).json({errors})

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
}

exports.uploadImage = (req, res) => {
  let imageFileName 
  let imageToBeUploaded = {};
  const busboy = new Busboy({ headers: req.headers });
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname);
    console.log(filename);
    console.log(mimetype);
    if(mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res.status(400).json({ error: "Wrong file type"})
    }
     const imageExtension = filename.split('.')[filename.split('.').length - 1];
     imageFileName = `${Math.round(Math.random()*1000000000)}.${imageExtension}`;
     const filepath = path.join(os.tmpdir(), imageFileName);
     imageToBeUploaded = {filepath, mimetype};
     file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('finish', () => {
    admin.storage().bucket(firebaseConfig.storageBucket).upload(imageToBeUploaded.filepath, {
      resumable: false,
      metadata: {
        metadata: {
          contentType: imageToBeUploaded.mimetype
        }
      }
    })
    .then(() => {
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
      return db.doc(`/users/${req.user.handle}`).update({imageUrl})
    })
    .then(() => {
      return res.json({message: 'Image uploaded successfully'})
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    });
  });
  busboy.end(req.rawBody);
};

exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body)
  db.doc(`/users/${req.user.handle}`).update(userDetails)
    .then(() => {
      return res.json({ message: 'Details added successfully'})
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    })
}

exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.handle}`).get()
    .then(doc => {
      if(doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection('likes')
          .where('userHandle', '==', req.user.handle)
          .get()
      }
    })
    .then(data => {
      userData.likes = [];
      data.forEach(doc => {
        userData.likes.push(doc.data());
      });
      return res.json(userData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code})
    });
};