import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import auth from "./middleware/auth";
import User from "./models/User";
dotenv.config();

const app = express();
const PORT = 5000;

mongoose
  .connect(
    // eslint-disable-next-line no-undef
    process.env.PRODUCTION ? process.env.MONGO_URL_PROD : process.env.MONGO_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// application/json
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("Hello World!"));

app.post("/api/users/register", (req, res) => {
  // If you get the information you need to sign up from the client,
  // Put them in the database.

  const user = new User(req.body);

  // eslint-disable-next-line no-unused-vars
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

app.post("/api/users/login", (req, res) => {
  // Find the requested email in the database.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "There are no users corresponding to the email provided.",
      });
    }

    // If the requested email is in the database, verify that the password is correct.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "Wrong password." });

      // Generate token if password is correct.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // Save Token. Where? Cookie, LocalStorage
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

// role 1 admin role 2 specific departmental admin
// role 0 -> general user If not roule 0 administrator
app.get("/api/users/auth", auth, (req, res) => {
  // It have been through middleware all this way, mean that authentication is true.
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);
