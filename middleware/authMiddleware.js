const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
module.exports = function (req, res, next) {
  // gets the auth token from the req header
  const token = req.headers.authorization;

  try {
    console.log(secretKey);
    // verifies the token
    const decoded = jwt.verify(token, secretKey);
    console.log(decoded);

    res.locals.email = decoded.email;

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).send("Invalid Token");
    } else if (err.name === "TokenExpiredError") {
      return res.status(401).send("Token Expired");
    } else {
      return res.status(401).send("Bad Token");
    }
  }
};
