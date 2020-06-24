const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
   username: String,
   email: String,
   password: String,
   isAdmin: Boolean,
   isMod: Boolean,
   avatar: {
      avatarId: String,
      avatarUrl: String
   }
}, {timestamps: true});


userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);


module.exports = User;