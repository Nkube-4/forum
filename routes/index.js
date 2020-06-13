const express = require("express");
const passport = require("passport");
const router = express.Router();
// models
const User = require("../models/user");

router.get("/", (req, res) => {
	// res.send("Welcome to my forum");
	// build index or redirect?
	res.redirect("/forums");
});

router.get("/register", (req, res) => {
	// res.send("Register route");
	res.render("register.ejs");
});

router.post("/register", (req, res) => {
	console.log(req.body);
	let user = {
		email: req.body.email,
		username: req.body.username
	};

	User.register(new User(user), req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("/");
		}

		console.log(user);
		console.log("registered");
		// console.log(req);
		passport.authenticate("local",{failureFlash: true})(req, res, function () {
			console.log("authenticated");
			res.redirect("/");
		});
	})
});

router.get("/login", (req, res) => {
	
	// res.send("Login route");
	res.render("login.ejs");
});

router.post(
	"/login",
	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/login",
		failureFlash: true
	}),
	(req, res) => {
		// res.send("Login route");
	}
);

router.get("/logout", (req, res) => {
	console.log("logged out");
	req.logOut();
	res.redirect("/");
	// res.send("Logout route");
});

module.exports = router;
