const bcrypt = require('bcryptjs');

const plainPassword = "twk-99";
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Hashed Password:", hash);
  }
});
