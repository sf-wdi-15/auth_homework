var express = require("express"),
  	bodyParser = require("body-parser"),
  	db = require("./models"),
  	passport = require("passport"),
  	session = require("cookie-session"),
  	app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(session( {
	secret: 'thisismysecretkey',
	name: 'chocolate chip',
	maxage: 3600000
})
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
	console.log("SERIALIZED JUST RAN!");

	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	console.log("DESERIALIZED JUST RAN!");
	db.user.find({
		where: {
			id: id
		}
	})
	.then(function(user){
		done(null, user);
	},
	function(err) {
		done(err, null);
	});
});

app.get("/sign_up", function(req, res) {
	res.render("users/sign_up")
});

app.post("/users", function (req, res) {
	console.log("POST /users");
	var newUser = req.body.user;
	console.log("New User:", newUser);
	db.user.createSecure(newUser.email, newUser.password,
		function () {
			res.redirect("/sign_up");
		},
		function (err, user) {
			req.login(user, function(){
				console.log("Id: ", user.id)
				res.redirect('/users/' + user.id);
			});
		})
});

app.get("/users/:id", function (req, res) {
	var id = req.params.id;
	db.user.find(id)
		.then(function (user) {
			res.render("users/show", {user: user});
		})
		.error(function () {
			res.redirect("/sign_up");
		})
});

app.get("/login", function (req, res) {
	res.render("users/login");
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login'
}));

app.get("/", function (req, res) {
	console.log(req.user)

	if(req.user) {
		res.render("site/index", {user: req.user});
	} else {
		res.render("site/index", {user: false});
	}
});

app.get("/logout", function (req, res) {
	req.logout();
	res.redirect("/");
});

app.listen(3000, function () {
	console.log("LISTENING");
})
