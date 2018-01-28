//dependencies
var bodyParser 		= require("body-parser"),
	methodOverride  = require("method-override");
	request 		= require("request"),
	mongoose 		= require("mongoose"),
	express 		= require("express"),

	passport 		= require("passport"),
	LocalStrategy 	= require("passport-local"),

	//models
	notes 			= require("./others.js")
	Dm 				= require("./models/demands"),
	Sp 				= require("./models/supply"),
	User 			= require("./models/user"),
	seedDB 			= require("./models/seeds");


var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(methodOverride("_method"));

//================== DB setup ============
mongoose.Promise = global.Promise;
var uri = "mongodb://xianhomedroy:19980110.Zz@ds046267.mlab.com:46267/uzedb";
mongoose.connect(uri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//================== PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Rusty",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //use the function form user model
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=============================== others =====
// request('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCXgzdvX_NggJZqfYKEceahh2do7zED09c', function(err, response, body){
// 	var parsedData = JSON.parse(body);

// 	if(response.statusCode == 200) {     //things worked     console.log(body);
//   		console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//   		console.log('Sunset at Huwaii is at :', parsedData["homeMobileCountryCode"]); 
//   	}
// });

//middleware
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
});

//==================================== Routes =================
app.get("/", function(req,res){
	//special
	res.render("index", {currentUser: req.user});
});

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

//----------------supply
app.get("/supply", isLoggedIn, function(req,res){
	res.render("supply");
});

app.post("/supplied", isLoggedIn, function(req,res){
	//-----------------need modification
	Sp.create(req.body.supply, function(err, newDemand){
		if(err){
			console.log("storing demand POST error!");
			console.log(err);
		}else{
			console.log("================== here is the new supply: ==========");
			console.log(newDemand);
			console.log("================== end of the new demand data =======");
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

// =========================  AUTH ROUTES SETUP ==============
app.get("/signup", function(req,res){
	res.render("signup");
});

app.post("/signup", function(req,res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("signup");
		}
		passport.authenticate("local")(req,res,function(){
			console.log("register success!");
			res.redirect("/");
		});
	});
});

app.get("/login", function(req,res){
	res.render("login");
});

app.post("/login", passport.authenticate("local",{
	successRedirect: "/",
	railureRedirect: "/login"
}), function(req,res){
});

app.get("/logout", function(req,res){
	req.logout();
	res.redirect("/");
});

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

//---------------------server setup---------------------
app.listen(process.env.PORT,process.env.IP,function(){
	console.log("Uze server started");
});