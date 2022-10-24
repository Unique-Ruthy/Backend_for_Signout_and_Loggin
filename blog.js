const express = require("express");
const route = express.Router();
const Database = require("./database");

function createPostHandler(req, res) {
  const newPost = req.body;
  console.log(newPost);

  // ensures the title and content field is not empty
  if (newPost.title && newPost.content) {
    // create the post
    Database.post.push(newPost);
  } else {
    res
      .status(400)
      .json({
        success: false,
        message: "title and content field are required",
      });
  }

  res.status(201).json({ message: "Post created successfully" });
}

function getPostsHandler(req, res) {
  res
    .status(200)
    .json({ message: "Post retrieved successfully", data: Database.post });
}

route.post("/create", createPostHandler);
route.get("/", getPostsHandler);

module.exports = route;
