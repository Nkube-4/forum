const mongoose = require("mongoose");


const forumSchema = mongoose.Schema({
   forumName: String,
   subForums: [{
      type: mongoose.Types.ObjectId,
      ref: "SubForum"
   }],
   posts: [{
      type: mongoose.Types.ObjectId,
      ref: "Post"
   }],
   description: String

}, {timestamps: true});


Forum = mongoose.model("Forum", forumSchema);


module.exports = Forum;
