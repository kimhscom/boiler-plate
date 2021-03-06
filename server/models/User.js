import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = 10;

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    maxlength: 50,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 6,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

// Do not use arrow function, Because this variable is output as undefined.
UserSchema.pre("save", function (next) {
  const user = this;
  if (user.isModified("password")) {
    // Encrypt password.
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

UserSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UserSchema.methods.generateToken = function (cb) {
  const user = this;

  // Generate token using jsonwebtoken
  const token = jwt.sign(user._id.toHexString(), "secretToken");
  /* user._id + "secretToken" = token
     ->
     "secretToken" -> user._id */

  user.token = token;
  user.save((err, user) => {
    if (err) return cb(err);
    cb(null, user);
  });
};

UserSchema.statics.findByToken = function (token, cb) {
  const user = this;

  // user._id + "" = token;

  // Decode the token.
  jwt.verify(token, "secretToken", (err, decoded) => {
    /* Use user ID to find the user
    Validate that token imported from client matches to token held in DB */
    user.findOne({ _id: decoded, token: token }, (err, user) => {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const model = mongoose.model("User", UserSchema);
export default model;
