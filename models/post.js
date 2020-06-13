const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
   title: String,
   author: {
      type: mongoose.Types.ObjectId,
      ref: "User"
   },
   comments: [{
      type: mongoose.Types.ObjectId,
      ref: "Comment"
   }],
   imageUrl: String,
   text: String
   // likes and attachments 
}, {timestamps: true});

const Post = new mongoose.model("Post", postSchema);

module.exports = Post;