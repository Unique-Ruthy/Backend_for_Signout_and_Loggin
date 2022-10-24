const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const authMiddleware = require("./middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const salt = bcrypt.genSaltSync(10);
const cors = require("cors");

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const secretKey = process.env.SECRET_KEY;

const port = 7000;

const Database = {
  users: [],
  admin: [],
};

function createUserHandler(req, res) {
  const newUser = req.body;

  const userEmail = Database.users.filter(
    (user) => newUser.email === user.email
  );

  if (userEmail.length > 0) {
    res.status(409).json({ success: false, message: "User already exist" });
  } else {
    // let password = newUser.password;
    const hash = bcrypt.hashSync(newUser.password, salt);

    newUser.password = hash;

    // create a new user
    Database.users.push(newUser);
    res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  }
}

const getUsers = (req, res) => {
  res.status(200).json({
    message: "User gotten",
    data: Database.users,
  });
};

// app.use(
//   express.urlencoded({
//     extended: false,
//   })
// );

app.get("/users", getUsers);

let userLogin = (req, res) => {
  let { email, password } = req.body;
  console.log(password);
  if (email == "" || password === "") {
    res.status(401).json({
      status: "failed",
      message: "Please input email or password",
    });
  } else {
    let userExist = Database.users.filter((user) => user.email === email);

    if (userExist.length == 0) {
      res.status(404).json({ status: "failed", message: "User not found" });
    } else {
      if (bcrypt.compareSync(password, userExist[0].password)) {
        const token = jwt.sign({ email }, secretKey, {
          expiresIn: "3d",
        });

        // userExist[0].token = token;
        res
          .status(200)
          .json({ status: "success", message: "User Login", token });
      } else {
        res.status(404).json({ status: "failed", message: "Opps! wrong user" });
      }
    }
  }
};

// Update user
function updateUser(req, res) {
  const data = res.locals;

  if (data.email) {
    const userIndex = Database.users.findIndex(
      (item) => item.email === data.email
    );
    console.log(userIndex);

    if (userIndex < 0) {
      res.status(401).send("User not found");
    } else {
      const updatedData = { ...Database.users[userIndex], ...req.body };
      console.log(updatedData);
      Database.users[userIndex] = updatedData;

      res.send("Account updated successfully");
    }
  }
}

const getUser = (req, res) => {
  // gets the email from locals
  const email = res.locals.email;

  // gets the user from teh database
  const usersData = Database.users.find((res) => res.email === email);

  if (usersData) {
    // deletes password field from teh object
    delete usersData.password;

    res.status(200).json({
      message: "User detail retrieved successfully",
      data: usersData,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "User not found in the system",
    });
  }
};
function authMiddleWare(req, res, next) {
  const token = req.headers.authorization;
  try {
    const decoded = jwt.verify(token, secretKey);
    console.log(decoded.email);
    // attaches the email to res object
    res.locals.email = decoded.email;
    // moves the request to the next middleware in line
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
}

app.get("/user", authMiddleWare, getUser);

app.put("/users/update", authMiddleware, updateUser);

app.post("/auth/signup", createUserHandler);

app.post("/auth/login", userLogin);

app.listen(port);
