import User from "../models/User";

let auth = (req, res, next) => {
  // Where to process authentication
  // Import tokens from client cookies.
  let token = req.cookie.x_auth;

  // Finding the user after decoding the token.
  User.findByToken();

  // Authentication OKay if user exists
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true });

    req.token = token;
    req.user = user;
    next();
  });
  // No authentication without users!
};

export default auth;
