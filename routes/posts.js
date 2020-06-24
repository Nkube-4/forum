const express = require("express");
const router = express.Router();
const Forum = require("../models/forum");
const Post = require("../models/post");
const Comment = require("../models/comment");
const middleware = require("../middleware/index");
const multer = require("multer");
const cloudinary = require("cloudinary");
// multer config
const storage = multer.diskStorage({
	filename: function (req, file, cb) {
		cb(null, Date.now() + "-" + file.originalname);
	},
});
let imageFilter = function (req, file, cb) {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error("Only image files are allowed!"), false);
	}
	cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter });
// cloudinary config
cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.CLOUD_API_KEY,
   api_secret: process.env.CLOUD_API_SECRET
});




router.get("/forums/:forumId/posts", (req, res) => {
   // show all posts
   // not needed?
   
});

router.get("/forums/:forumId/posts/new", middleware.isLoggedIn, (req, res) => {
   // show form for new post
   res.render("posts/newPost", {forumId: req.params.forumId});
   // res.send("new post form route");
});

router.post("/forums/:forumId/posts", middleware.isLoggedIn, upload.array("images", 4), async(req, res) => {
   // add new post
   console.log(req.files);
   let images = []; 
   if(req.files) {
      for(let i=0; i<req.files.length; i++){
         let image = await uploadImage(req.files[i]);
         images.push(image);
      }
   }

   // console.log(images);

   Forum.findById(req.params.forumId, (err, forum) => {

      if(err || !forum) {
         req.flash("error", "Oops not found");
         res.redirect(`/forums/${req.params.forumId}`);
      } else {
         let newPost = {
            title: req.body.post.title,
            text: req.body.post.text,
            author: req.user._id,
            images: images
         };
         console.log(newPost);
         Post.create(newPost, (err, post) => {
            if(err) {
               console.log(err);
               res.redirect(`/forums/${req.params.forumId}`);
            } else {
               forum.posts.push(post._id);
               forum.save();
               console.log("forum saved with new post");
               req.flash("success", "Post created");
               res.redirect(`/forums/${req.params.forumId}/posts/${post._id}/1`);
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

router.get("/forums/:forumId/posts/:postId/1/edit", middleware.isPostOwner, (req, res) => {
   // show form to edit post
   // console.log("edit form route");
   Post.findById(req.params.postId, (err, post) => {
      if(err || !post) {
         req.flash("error", "Oops not found");
         console.log(err);
      } else {
         // console.log("redirecting");
         res.render("posts/editPost", {post: post, forumId: req.params.forumId});
      }
   });
   
   // res.send("edit post form route");
});

router.put("/forums/:forumId/posts/:postId", middleware.isPostOwner, upload.array("images", 4), async(req, res) => {
   // upload new images
   // console.log("in put route");
   console.log(req.files);
   let images = [];
   if(req.files) {
      for(let i=0; i<req.files.length; i++){
         let image = await uploadImage(req.files[i]);
         images.push(image);
      }
   }
   req.body.post.images = images;   
   console.log(req.body.post);

   // update a particular post
   Post.findByIdAndUpdate(req.params.postId, req.body.post, async(err, result) => {
      if(err || !result) {
         req.flash("error", "Oops not found");
         console.log(err);
      } else {
         console.log(result);
         // delete old images
         if(req.body.post.images.length > 0) {
            for(let i=0; i<result.images.length; i++) {
               await deleteImage(result.images[i]);
               // console.log("deleted image");
            }
         }
         req.flash("success", "Post updated");
         res.redirect(`/forums/${req.params.forumId}/posts/${req.params.postId}/1`);
      }
   });
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
         // delete images
         for(let i=0; i<post.images.length; i++){
            await deleteImage(post.images[i]);
         }
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

function uploadImage(image) {
   return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(image.path, (err, result) => {
         if(err) {
            reject(err);
         } else {
            let image = {
               imgId: result.public_id,
               imgUrl: result.secure_url
            };
            resolve(image);
         }
      });
   });
}

function deleteImage(image) {
   return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.destroy(image.imgId, (err, result) => {
         if(err) {
            reject(err);
         } else {
            console.log(result);
            resolve("image deleted");
         }
      });
   });
}

module.exports = router;