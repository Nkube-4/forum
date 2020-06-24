const Post = require("../models/post");
const Comment = require("../models/comment");
const middlewareObj = {};

middlewareObj.isAdmin = function(req, res, next) {
   if(req.isAuthenticated()) {
      if(req.user.isAdmin) {
         console.log("is admin");
         return next();
      } else {
         console.log("no permission to do that");
         req.flash("error", "You don't have permission to do that");
         res.redirect("/");
      }
   } else {
      console.log("you need to be logged in");
      req.flash("error", "You need to be logged in for that");
      res.redirect("/login");
   }
}

middlewareObj.isPostOwner = function(req, res, next) {
   console.log("in middleware postOwner");
   if(req.isAuthenticated()) {
      
      if(req.user.isAdmin || req.user.isMod) {
         console.log("is admin or mod");
         return next();
      }
      Post.findById(req.params.postId, (err, post) => {
         if(err) {
            console.log(err);
         } else {
            // console.log(post);
            if(post.author.equals(req.user._id)) {
               console.log("is owner");
               return next();
            } else {
               console.log("is not owner");
               req.flash("error", "You don't have permission to do that");
               res.redirect("back");
            }
         }
      });

   } else {
      console.log("you need to be logged in");
      req.flash("error", "You need to be logged in for that");
		res.redirect("/login");
   }
};

middlewareObj.isCommentOwner = function(req, res, next) {
   if(req.isAuthenticated()) {
      if(req.user.isAdmin || req.user.isMod) {
         console.log("is admin or mod");
         return next();
      }
      Comment.findById(req.params.commentId, (err, comment) => {
         if(err) {
            console.log(err);
         } else {
            if(comment.author.equals(req.user._id)) {
               console.log("is owner");
               return next();
            } else {
               console.log("is not owner");
               req.flash("error", "You don't have permission to do that");
               res.redirect("back");
            }
         }
      });

   } else {
      console.log("you need to be logged in");
      req.flash("error", "You need to be logged in for that");
		res.redirect("/login");
   }
};


middlewareObj.isLoggedIn = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
   // req.flash("error", "You need to be logged in to do that");
   console.log("not logged in");
   req.flash("error", "Please log in");
	res.redirect("/login");
};

module.exports = middlewareObj;