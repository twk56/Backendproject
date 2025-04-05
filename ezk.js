const bcrypt = require('bcryptjs');


bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Hashed Password:", hash);
  }
});
