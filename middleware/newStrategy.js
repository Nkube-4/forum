const passport = require("passport");
const User = require("../models/user");
const localStrategy = require("passport-local").Strategy;


const strat = new localStrategy(
   function(username, password, done) {
      User.findOne({$or:[{username: username}, {email: username}]}, function(err, user) {
         console.log("in custom strategy");
         console.log(err);
         if(err) return done(err);

         if(!user) {
            console.log("no user found");
            // req.flash("error", "Incorrect username or password");
            return done(null, false, { message: "Incorrect username or password." });
         }

         user.authenticate(password, (err, user) => {
            if(err) {
               console.log(err);
               console.log("password wrong");
               // req.flash("error", "Incorrect username or password");
               return done(null, false, { message: "Incorrect username or password"});
            }

            // console.log(user);
            return done(null, user);
         });

         console.log("strat working");
         
      });
   }
);

module.exports = strat;
