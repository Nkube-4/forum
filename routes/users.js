const express = require("express");
const router = express.Router();
// models
const User = require("../models/user");
const Forum = require("../models/forum");
const Post = require("../models/post");
const subForum = require("../models/subforum");
const Comment = require("../models/comment");
const middleware = require("../middleware/index");

router.get("/users/profile", async (req, res) => {
   // need to find forum that contains post and comments
   console.log("user profile");
   // console.log(req.user);
   let userData = {};

   userData.posts = await Forum.aggregate([
      {
         $lookup: {
         from: "posts",
         localField: "posts",
         foreignField: "_id",
         as: "post"
         }
      },
      {
         $unwind: {path: "$post"}
      },
      {
         $match: {"post.author": req.user._id}
      },
   ]);

   userData.comments = await Forum.aggregate([
      {
         $lookup: {
         from: "posts",
         localField: "posts",
         foreignField: "_id",
         as: "posts"
         }
      },
      {
         $lookup: {
            from: "comments",
            localField: "posts.comments",
            foreignField: "_id",
            as: "comments"
         }
      },
      {
         $unwind: "$posts"
      },
      {
         $unwind: "$comments"
      },
      {
         $match: {"comments.author": req.user._id}
      },
      {
         $group: {
            "_id":"$comments", "doc": {"$first":"$$ROOT"}
         }
      },
      {
         $replaceRoot: {"newRoot": "$doc"}
      }
      
   ]);
   console.log("posts");
   console.log(userData.posts);
   console.log("comments");
   // console.log(userData.comments);

   res.render("users/userProfile", {userData});
});



module.exports = router;