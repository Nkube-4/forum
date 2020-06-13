const express = require("express");
const router = express.Router();
const Forum = require("../models/forum");
const Post = require("../models/post");
const Comment = require("../models/comment");
const middleware = require("../middleware/index");

router.get("/forums/:forumId/posts", (req, res) => {
   // show all posts
   // not needed?
   
});

router.get("/forums/:forumId/posts/new", middleware.isLoggedIn, (req, res) => {
   // show form for new post
   res.render("posts/newPost", {forumId: req.params.forumId});
   // res.send("new post form route");
});

router.post("/forums/:forumId/posts", middleware.isLoggedIn, (req, res) => {
   // add new post
   Forum.findById(req.params.forumId, (err, forum) => {

      if(err || !forum) {
         req.flash("error", "Oops not found");
         res.redirect(`/forums/${req.params.forumId}`);
      } else {
         let newPost = {
            title: req.body.post.title,
            text: req.body.post.text,
            author: req.user._id
         }
         Post.create(newPost, (err, post) => {
            if(err) {
               console.log(err);
               res.redirect(`/forums/${req.params.forumId}`);
            } else {
               forum.posts.push(post._id);
               forum.save();
               console.log("forum saved with new post");
               req.flash("success", "Post created");
               res.redirect(`/forums/${req.params.forumId}`);
            }
         });

      }
   })
   // res.send("add new post route");
});

router.get("/forums/:forumId/posts/:postId/:page", async(req, res) => {
   let perPage = 7;
   let page = req.params.page || 1;

   let forum = await Forum.findById(req.params.forumId);
   // show info about a post
   Post.findById(req.params.postId).populate([{path: "author"}, {path: "comments", populate:{path: "author"}}]).exec((err, post) => {
      if(err || !post) {
         console.log(err);
         req.flash("error", "Oops not found");
         res.redirect("back");
      } else {
         post.currentPage = page;
			post.totalPages = Math.ceil(post.comments.length / perPage);
			post.comments = post.comments.splice((perPage * page) - perPage, perPage);
         console.log(post);
         res.render("posts/showPost", {post, forumId: req.params.forumId, forumName: forum.forumName});
      }
   });
});

router.get("/forums/:forumId/posts/:postId/edit", middleware.isPostOwner, (req, res) => {
   // show form to edit post
   Post.findById(req.params.postId, (err, post) => {
      if(err || !post) {
         req.flash("error", "Oops not found");
         console.log(err);
      } else {
         res.render("posts/editPost", {post, forumId: req.params.forumId});
      }
   });
   
   // res.send("edit post form route");
});

router.put("/forums/:forumId/posts/:postId", middleware.isPostOwner, (req, res) => {
   // update a particular post
   Post.findByIdAndUpdate(req.params.postId, req.body.post, (err, post) => {
      if(err || !post) {
         req.flash("error", "Oops not found");
         console.log(err);
      } else {
         console.log(post);
         req.flash("success", "Post updated");
         res.redirect(`/forums/${req.params.forumId}/posts/${req.params.postId}`);
      }
   })
});

router.delete("/forums/:forumId/posts/:postId", middleware.isPostOwner, (req, res) => {
   // delete a particular post
   Post.findByIdAndDelete(req.params.postId, async (err, post) => {
      if(err || !post) {
         req.flash("error", "Oops not found");
         console.log(err);
      } else {
         console.log(post);
         // delete the comments on the post
         await deleteComments(post.comments);
         // find the forum and update its post array
         Forum.findByIdAndUpdate(req.params.forumId, {$pullAll: {posts: [post._id]}}, (err, forum) => {
            if(err) {
               console.log(err);
            } else {
               console.log(forum);
               req.flash("success", "Post deleted");
               res.redirect(`/forums/${req.params.forumId}`);
            }
         });
      }
   })
   // res.send("delete post route");
});

function deleteComments(commentsArray) {
   if(commentsArray.length > 0) {
      return new Promise(resolve => {
         commentsArray.forEach(comment => {
            Comment.findByIdAndDelete(comment, err => {
               if(err) {
                  console.log(err);
               }
            });
         });
         resolve("comments deleted");
      });
   }
}

module.exports = router;