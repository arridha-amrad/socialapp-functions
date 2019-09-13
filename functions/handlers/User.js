const {db, firebase} = require('../utils/Admin')
const {signupValidator, signinValidator} = require('../utils/Validators');

exports.Signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const {errors, valid} = signupValidator(newUser)
  if(!valid) return res.status(400).json(errors)

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