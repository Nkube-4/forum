const express = require("express");
const router = express.Router();
// models
const User = require("../models/user");
const Forum = require("../models/forum");
const Post = require("../models/post");
const subForum = require("../models/subforum");
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
	api_secret: process.env.CLOUD_API_SECRET,
});


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

router.put("/users/profile", upload.single("avatar"), async(req, res) => {
   console.log("hey user profile put");
   let userInfo = {
      username: req.body.username
   };
   if(req.file) {
      // console.log(req.file);
      userInfo.avatar = await uploadImage(req.file);
   }
   // console.log(req.body);
   console.log(userInfo);

   User.findByIdAndUpdate(req.user._id, userInfo, async(err, user) => {
      if(err) {
         console.log(err);
      } else {
         if(user.avatar) {
            await deleteImage(user.avatar);
         }
         console.log("user updated");
         res.redirect("/users/profile");
      }
   })

});

function uploadImage(image) {
	return new Promise((resolve, reject) => {
		cloudinary.v2.uploader.upload(image.path, (err, result) => {
			if (err) {
				reject(err);
			} else {
				let avatar = {
					avatarId: result.public_id,
					avatarUrl: result.secure_url,
				};
				resolve(avatar);
			}
		});
	});
}

function deleteImage(image) {
	return new Promise((resolve, reject) => {
		cloudinary.v2.uploader.destroy(image.avatarId, (err, result) => {
			if (err) {
				reject(err);
			} else {
				console.log(result);
				resolve("image deleted");
			}
		});
	});
}


module.exports = router;