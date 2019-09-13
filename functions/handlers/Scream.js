const {db} = require('../utils/Admin')

exports.getAllScreams = (req, res) => {
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
}

exports.createNewScream = (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Request method not allowed" })
  }
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
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
}