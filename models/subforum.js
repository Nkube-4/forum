const mongoose = require("mongoose");

const subForumSchema = new mongoose.Schema({
   name: String,
   posts: [{
      type: mongoose.Types.ObjectId,
      ref: "Post"
   }],
   description: String,

}, {timestamps: true});

const SubForum = mongoose.model("SubForum", subForumSchema);

module.exports = SubForum;