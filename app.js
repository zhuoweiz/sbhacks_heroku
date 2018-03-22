//dependencies
var bodyParser 		= require("body-parser"),
	cookieParser 	= require("cookie-parser"),
	methodOverride  = require("method-override"),
	flash        	= require("connect-flash"),
	session 		= require("express-session"),
	request 		= require("request"),
	mongoose 		= require("mongoose"),
	express 		= require("express"),

	passport 		= require("passport"),
	LocalStrategy 	= require("passport-local"),
	GoogleStrategy	= require("passport-google-oauth").OAuthStrategy,
	async 			= require("async"),
	nodemailer 		= require("nodemailer"),	

	//models
	notes 			= require("./others.js")
	Dm 				= require("./models/demands"),
	Sp 				= require("./models/supply"),
	User 			= require("./models/user"),
	seedDB 			= require("./models/seeds");

// configure dotenv
// wtf is this
require('dotenv').config();

//system configuration
var app = express();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
// app.use(express.static('public'));
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(cookieParser('secret'));
app.locals.moment = require('moment');

// --------------- google auth -----
// passport.use(new GoogleStrategy({
// 	consumerKey: ,
// 	consumerSecret: ,
// 	callbackURL: 
// 	},

// 	function(token, tokenSecret, profile, done){
// 		User.findOrCreate({ googleID: profile.id }, function(err, user){
// 			return done(err, user);
// 		});
// 	}
// ));

//================== DB setup ============
mongoose.Promise = global.Promise;
var uri = "mongodb://xianhomedroy:19980110.Zz@ds046267.mlab.com:46267/uzedb";
mongoose.connect(uri);
//mongoose.connect("process.env.DATABASEURL");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//================== PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Rusty", //dont know wtf is this
	resave: false,
	saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //use the function form user model
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware
//wtf is this
//An object that contains response local variables scoped to the request, and therefore available only to the view(s) rendered during that request / response cycle (if any).
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

//==================================== Routes =================

//============= routes configuration ========
var indexRoutes = require("./routes/index");
var userpageRoutes = require("./routes/userpage");
app.use("/", indexRoutes);
app.use('/userpage/', userpageRoutes);

//---------------demand
app.get("/demand", isLoggedIn, function(req,res){
	res.render("demand");
});

app.post("/demanded", isLoggedIn, function(req,res){
	//-----------------need modification
	Dm.create(req.body.demand, function(err, newDemand){
		if(err){
			console.log("storing demand POST error!");
			console.log(err);
		}else{
			console.log("================== here is the new demand: ==========");
			console.log(newDemand);
			console.log("================== end of the new demand data =======");
			res.redirect("/demanded");
		}
	});
});

app.get("/demanded", function(req,res){
	res.render("demanded");
});

//----------------create supply
app.get("/supply", isLoggedIn, function(req,res){
	res.render("supply");
});

app.post("/supplied", isLoggedIn, function(req,res){
	var supply_query = req.body.supply;

	//-----------------need modification
	Sp.create(supply_query, function(err, newSupply){
		if(err){
			console.log("storing supply POST error!");
			console.log(err);
		}else{
			// var tempUser = req.user;
			console.log("======================== create supply SUCCSSS: ", req.user);

			var tempUserEmail = req.user.username;
			User.findOne({username:req.user.username}, function(err, foundUser){
				if(err){
					console.log(err);
				}else{
					foundUser.supplyPosts.push(newSupply._id);
					foundUser.save(function(err,data){
						if(err){
							console.log("zhuo: new supply save user error");
							console.log(err);
						}else{
							console.log('zhuo: here is the new user data after adding a supply');
							console.log(data);
						}
					});
				}
			});

			// User.findOne({email:"bob@gmail.com"}, function(err, foundUser){
			// 	if(err){
			// 		console.log(err);
			// 	}else{
			// 		foundUser.posts.push(post);
			// 		foundUser.save(function(err, data){
			// 			if(err){
			// 				console.log(err);
			// 			}else{
			// 				console.log(data);
			// 			}
			// 		});
			// 	}
			// });

			console.log("================== here is the new supply: ==========");
			console.log(newSupply);
			console.log("================== end of the new supply data =======");
			res.redirect("/supplied");
		}
	});



});

app.get("/supplied", function(req,res){
	res.render("supplied");
});
// app.get("/demand",function(req,res){
// 	res.render("demand");
// });

// ======================================================
// ======================== end of auth =================

// ---------------------------------------------------
// ---------------- start of middlewares -------------
// ---------------------------------------------------
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}



// =========================  OTHER ROUTES ==========
app.get("/contact", function(req,res){
	res.render("contact");
});

//---------------------server setup---------------------process.env.PORT,process.env.IP
var port = process.env.PORT || 5000;
app.listen(port,function(){
	console.log("Uze server started");
});