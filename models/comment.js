const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
   text: String,
   author: {
      type: mongoose.Types.ObjectId,
      ref: "User"
   },
   // likes
}, {timestamps: true});


const Comment = new mongoose.model("Comment", commentSchema);

module.exports = Comment;