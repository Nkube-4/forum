const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const app = express();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");
const strat = require("./middleware/newStrategy");


mongoose.connect(process.env.DB_STRING_REMOTE, {useNewUrlParser: true, useUnifiedTopology: true});
// routes 

const index = require("./routes/index");
const forums = require("./routes/forums");
const posts = require("./routes/posts");
const comments = require("./routes/comments");
const users = require("./routes/users");

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));


app.use(
	require("express-session")({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());

const User = require("./models/user");

passport.use(strat);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());

app.use(function (req, res, next) {
	res.locals.user = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
	next();
});

app.use(index);
app.use(forums);
app.use(posts);
app.use(comments);
app.use(users);

app.use(function (req, res, next) {
	res.status(404);

	// respond with html page
	if (req.accepts("html")) {
		res.render("404", { url: req.url });
		return;
	}

	// respond with json
	if (req.accepts("json")) {
		res.send({ error: "Not found" });
		return;
	}

	// default to plain-text. send()
	res.type("txt").send("Not found");
});


app.listen(process.env.PORT, process.env.IP, () => console.log("Forum started"));