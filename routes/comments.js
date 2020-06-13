const express = require("express");
const router = express.Router();
// models
const User = require("../models/user");
const Forum = require("../models/forum");
const Post = require("../models/post");
const subForum = require("../models/subforum");
const Comment = require("../models/comment");
const middleware = require("../middleware/index");

router.get("/forums/:forumId/posts/:postId/comments", (req, res) => {
	// show all comments
	
});

router.get("/forums/:forumId/posts/:postId/comments/new", middleware.isLoggedIn, (req, res) => {
	// show the new comment form
	res.render("./comments/newComment", {forumId: req.params.forumId, postId: req.params.postId});
});

router.post("/forums/:forumId/posts/:postId/comments", middleware.isLoggedIn, (req, res) => {
   // add new comment
   console.log(req.body);
   console.log(req.user);
   let comment = {
      text: req.body.comment.text,
      author: req.user._id
   };
   Post.findById(req.params.postId, (err, post) => {
      if(err || !post) {
         req.flash("error", "Oops not found");
         console.log(err);
      } else {
         Comment.create(comment, (err, com) => {
            if(err) {
               console.log(err);
            } else {
               console.log(com);
               post.comments.push(com._id);
               post.save();
               console.log("created comment and saved it to post");
               req.flash("success", "Comment created");
               res.redirect(`/forums/${req.params.forumId}/posts/${req.params.postId}`);
            }
         });
      }
   });
   // res.send("add new coment route");
});

router.get("/forums/:forumId/posts/:postId/comments/:commentId", (req, res) => {
	// show specific comment
	// ???? 
});

router.get("/forums/:forumId/posts/:postId/comments/:commentId/edit", middleware.isCommentOwner, (req, res) => {
   // show the edit comment form
   res.render("./comments/editComment",{forumId: req.params.forumId, postId: req.params.postId, commentId: req.params.commentId});
	// res.send("comment edit form route");
});

router.put("/forums/:forumId/posts/:postId/comments/:commentId", middleware.isCommentOwner, (req, res) => {
   // update a specific comment
   console.log(req.body);
   Comment.findByIdAndUpdate(req.params.commentId,{text: req.body.comment.text}, (err, comment) => {
      if(err || !comment) {
         req.flash("error", "Oops not found");
         console.log(err);
      } else {
         console.log(comment);
         req.flash("success", "Comment updated");
         res.redirect(`/forums/${req.params.forumId}/posts/${req.params.postId}`);
      }
   });
	// res.send("update comment route");
});

router.delete("/forums/:forumId/posts/:postId/comments/:commentId", middleware.isCommentOwner, (req, res) => {
   Comment.findByIdAndDelete(req.params.commentId, (err, comment) => {
      if(err || !comment) {
         req.flash("error", "Oops not foud");
         console.log(err);
      } else {
         console.log("comment deleted");
         Post.findByIdAndUpdate(req.params.postId, {$pullAll: {comments: [comment._id]}}, (err, post) => {
            if(err || !post) {
               console.log(err);
            } else {
               console.log("post updated")
               console.log(post);
               req.flash("success", "Comment deleted");
               res.redirect(`/forums/${req.params.forumId}/posts/${req.params.postId}`);
            }
         });
      }
   });
	// delete a specific comment
	// res.send("delete comment route");
});

module.exports = router;