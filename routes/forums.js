const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
// models
const User = require("../models/user");
const Forum = require("../models/forum");
const Post = require("../models/post");
const subForum = require("../models/subforum");
const Comment = require("../models/comment");
const middleware = require("../middleware/index");

router.get("/forums", (req, res) => {
   // show forums
   console.log(req.user);
   Forum.find({}, (err, forums) => {
      if(err) {
         console.log(err);
      } else {
         console.log(forums);
         console.log(req.user);
         res.render("index", {forums});
      }
   });
});

router.get("/forums/new", middleware.isAdmin, (req, res) => {
   // show new forum form
   res.render("./forums/newForum.ejs");
});

router.post("/forums", middleware.isAdmin, (req, res) => {
   // create new forum then redirect
   console.log(req.body);
   Forum.create(req.body.forum, err => {
      if(err) {
         console.log(err);
      } else {
         req.flash("success", "Forum created");
         res.redirect("/");
      }
   });
});

router.get("/forums/:forumId/:page", (req, res) => {
   let perPage = 7;
   // console.log(req.params.page);
   let page = parseInt(req.params.page) || 1;
   // console.log(page);
   //show specific forum info
   console.log(req.query);
   console.log(req.params);
   if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), "gi");
      Forum.aggregate(
      [
         {
            $match: {
               _id: mongoose.Types.ObjectId(req.params.forumId)
            },
         },
         {
            $lookup: {
               from: "posts",
               localField: "posts",
               foreignField: "_id",
               as: "posts",
            },
         },
         {
            $project: {
               posts: 1,
            },
         },
         {
            $unwind: "$posts"
         },
         {
            $match: {
               "posts.title": regex
            }
         }
      ],
      function (err, result) {
         if (err) {
            console.log(err);
         } else {
            console.log("hey");
            console.log(result);
            forum = {
               _id: result[0]._id,
               currentPage: page,
               totalPages: (Math.ceil(result.length/perPage)),
               posts: result.map(post => {
                  return post.posts;
               }),
            };
            // try with map or other array mehods
            console.log(forum);
            res.render("forums/showForum", {forum});
         }
      }
   );
   } else {
      Forum.findById(req.params.forumId).populate({path: "posts", populate: {path: "author"}}).exec((err, forum) => {
         if(err || !forum) {
            console.log(err);
            req.flash("error", "Oops not found!");
            res.redirect("/forums");
         } else {
            forum.currentPage = page;
            forum.totalPages = (Math.ceil(forum.posts.length/perPage));
            forum.posts = forum.posts.splice((perPage * page) - perPage, perPage);
            console.log(forum);
            res.render("forums/showForum", {forum});
         }
      });
   }
   
});

router.get("/forums/:forumId/edit", middleware.isAdmin, (req, res) => {
   // edit form for a specific forum
   console.log(req.params);
   Forum.findById(req.params.forumId, (err, forum) => {
      if(err || !forum) {
         console.log(err);
         req.flash("error", "Oops not found!");
         res.redirect("/forums");
      } else {
         console.log(forum);
         res.render("forums/editForum", {forum});
      }
   })
   
});

router.put("/forums/:forumId", middleware.isAdmin, (req, res) => {
   // update a forum and redirect
   console.log(req.body);
   console.log(req.params);
   Forum.findByIdAndUpdate(req.params.forumId, req.body.forum, (err, forum) => {
      if(err || !forum) {
         console.log(err);
         req.flash("error", "Oops not found!");
         res.redirect("/forums");
      } else {
         console.log(forum);
         req.flash("success", "Forum updated");
         res.redirect("/forums")
      }
   });
   // res.send("forum update");
});

router.delete("/forums/:forumId", middleware.isAdmin, (req, res) => {
   // delete a specific forum
   Forum.findByIdAndDelete(req.params.forumId, async (err,forum) => {
      if(err || !forum) {
         req.flash("error", "Oops not found!");
         console.log(err);
      } else {
         await deletePosts(forum.posts);
         await deleteSubForums(forum.subForums);
         req.flash("sucess", "Forum deleted");
         res.redirect("/forums");
      }
   });
   // res.send("delete route");
});

function deletePosts(posts) {
   console.log(posts);
   if(posts.length > 0) {
      return new Promise(resolve => {
         posts.forEach(postId => {
            Post.findByIdAndDelete(postId, (err, post) =>{
               if(err) {
                  console.log(err);
               } else {
                  console.log("post deleted");
                  // console.log(post);
                  deleteComments(post.comments);
                  
               }
            });
         });
         resolve("post deleted");
      });
   } else {
      console.log("no posts");
   }
}

function deleteSubForums(subForums) {
   console.log(subForums);
   if(subForums.length > 0) {
      return new Promise(resolve => {
         subForums.forEach(subForumId => {
            subForum.findByIdAndDelete(subForumId, (err, subForum) => {
               if(err) {
                  console.log(err);
               } else {
                  console.log("subforum deleted");
                  deletePosts(subForum.posts);
                  
               }
            });
         });
         resolve("subForums deleted");
      });
   } else {
      console.log("no subforums");
   }
}

function deleteComments(comments) {
   console.log(comments);
   if(comments.length > 0) {
      return new Promise(resolve => {
         comments.forEach(commentId => {
            Comment.findByIdAndDelete(commentId, err => {
               if(err) {
                  console.log(err);
               } else {
                  console.log("comment deleted");
               }
            });
         });
         resolve("comments deleted");
      });
   } else {
      console.log("no comments");
   }
}

function escapeRegex(text) {
   return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;