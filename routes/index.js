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
			req.flash("error", "Username or email already registered");
			return res.redirect("/register");
		}

		console.log(user);
		console.log("registered");
		// console.log(req);
		passport.authenticate("local", {failureFlash: true,})(req, res, function () {
			console.log("authenticated");
			req.session.id = user._id;
			req.flash("success", "Thanks for registering!");
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
		failureRedirect: "/login",
		failureFlash: true,
		failureFlash: "Wrong username or password.",
	}),
	(req, res) => {
		// res.send("Login route");
		console.log("login");
		req.session.userId = req.user._id;
		// console.log(req.session.userId);
		// console.log(req.session);
		res.redirect("/");
	}
);

router.get("/logout", (req, res) => {
	console.log("logged out");
	req.logOut();
	req.session.destroy();
	res.redirect("/");
	// res.send("Logout route");
});

module.exports = router;
