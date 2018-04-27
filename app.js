//dependencies
const bodyParser 		= require("body-parser"),
		cookieParser 	= require("cookie-parser"),
	methodOverride  = require("method-override"),
	flash        	= require("connect-flash"),
	session 		= require("express-session"),
	request 		= require("request"),
	mongoose 		= require("mongoose"),
	express 		= require("express"),
	multer = require('multer'),
	aws = require('aws-sdk'), 

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
	haha				= require("./models/googleMapApi"),
	// middleware = require("./models/middleware.js"), //not used
	seedDB 			= require("./models/seeds");

// configure dotenv
// wtf is this
require('dotenv').config();

//env configurations
var api_key = process.env.MAILGUN_API_KEY;
var domain = process.env.MAILGUN_API_DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

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
var uri = process.env.MONGOOSE_URI;
mongoose.connect(uri);
//mongoose.connect("process.env.DATABASEURL");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const S3_BUCKET = process.env.S3_BUCKET_NAME;
aws.config.region = 'us-west-1';

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

// ---------------------------------------------------
// ---------------- start of middlewares -------------
// ---------------------------------------------------
function isActivated(req, res, next){
	User.findOne({username:req.user.username}, function(err, foundUser){
			if(foundUser.isActivated!='false'){
				return next();
			}
			req.flash('error','Not activated yet');
			res.redirect("/userpage/"+foundUser._id+"/myaccount");
		});
}

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

// ================== MULTER CONFIG: to get file photos to temp server storage
let tempSupplyPhotoIdType = ".jpeg";
const multerConfig = {
    
storage: multer.diskStorage({
 //Setup where the user's file will go
 destination: function(req, file, next){
   next(null, './public/photo-db');
   },   
    
    //Then give the file a unique name
    filename: function(req, file, next){
        console.log(file);
        const ext = file.mimetype.split('/')[1];
        tempSupplyPhotoIdType = '.'+ext
        // next(null, file.fieldname + '-' + Date.now() + '.'+ext);
        var postArrayLength = req.user.supplyPosts.length + 1;
        next(null, req.user.username +'-supply-'+ postArrayLength + tempSupplyPhotoIdType);
      }
    }),   
    
    //A means of ensuring only images are uploaded. 
    fileFilter: function(req, file, next){
          if(!file){
            next();
          }
        const image = file.mimetype.startsWith('image/');
        if(image){
          console.log('photo uploaded');
          next(null, true);
        }else{
          console.log("file not supported");
          
          //TODO:  A better message response to user on failure.
          return next();
        }
    }
  };

//============= routes config ========
var indexRoutes = require("./routes/index");
var userpageRoutes = require("./routes/userpage");
var paymentRoute = require("./routes/payment");
// var mailgunRoutes = require("./routes/mailgun");
app.use("/", indexRoutes);
app.use('/userpage/', userpageRoutes);
app.use('/payment/', paymentRoute);

// ===========================================
// ---------------- ROUTES -------------
// ===========================================
app.get("/", function(req,res){
	var formData = {
	  'homeMobileCountryCode' : 310
	};
	// JSON.stringify(formData);
	
	var options = {
	  uri: 'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyDmnNAnAymv6aHy1S48ABCJNc9DV-F3vtk',
	  method: 'POST',
	  json: true,
	  body: formData
	};

	request(options, function (err, httpResponse, body) {
	  if (!err && httpResponse.statusCode == 200) {
	      // var info = JSON.parse(body);
	      var thisLocation = {
					param1:body.location.lat,
					param2:body.location.lng
				}
	      // console.log(typeof body.location.lat);
	      // console.log(typeof body.location.lng);
	     	
	     	console.log('function output: ',thisLocation );
				res.render('index',{thisLocation:thisLocation});

	  } else {
	      console.log('err: ',err);
	      // console.log('res: ', httpResponse);
	      console.log('body: ',body);

	      var thisLocation = {
					param1:'34',
					param2:'-118'
				}
				console.log('function output: ',thisLocation );
				res.render('index',{thisLocation:thisLocation});
	  }
	});
});

//---------------demand
app.get("/demand", isLoggedIn,isActivated, function(req,res){

	var formData = {
	  'homeMobileCountryCode' : 310
	};
	// JSON.stringify(formData);
	
	// ajax geolocation usage
	var options = {
	  uri: 'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyDmnNAnAymv6aHy1S48ABCJNc9DV-F3vtk',
	  method: 'POST',
	  json: true,
	  body: formData
	};

	request(options, function (err, httpResponse, body) {
	  if (!err && httpResponse.statusCode == 200) {
	      // var info = JSON.parse(body);
	      var thisLocation = {
					param1:body.location.lat,
					param2:body.location.lng
				}

	     	console.log('function output: ',thisLocation );
				res.render('demand',{thisLocation:thisLocation});

	  } else {
	      console.log('err: ',err);
	      // console.log('res: ', httpResponse);
	      console.log('body: ',body);

	      var thisLocation = {
					param1:'34',
					param2:'-118'
				}
				console.log('function output: ',thisLocation );
				res.render('demand',{thisLocation:thisLocation});
	  }
	});

});

app.post("/demanded", isLoggedIn,isActivated, function(req,res){
	//-----------------need modification
	// Dm.create(req.body.demand, function(err, newDemand){
	// 	if(err){
	// 		console.log("storing demand POST error!");
	// 		console.log(err);
	// 	}else{
	// 		console.log("================== here is the new demand: ==========");
	// 		console.log(newDemand);
	// 		console.log("================== end of the new demand data =======");
	// 		res.redirect("/demanded");
	// 	}
	// });
	var demand_query = req.body.demand;

	//dealing with input data
	var tempUserEmail = req.user.username;
	demand_query.d_owner = tempUserEmail;
	// console.log(" == adding supply... dimention "+ demand_query.length,demand_query.height);
	//换算
	var product = demand_query.length * demand_query.height * demand_query.width / 6270;
	demand_query.unit = (Math.round( product * 100 ) / 100).toFixed(2);
	// console.log(" = = = = huansuan: ",product +' - > '+demand_query.unit);

	Dm.create(req.body.demand, function(err, newDemand){
		if(err){
			console.log("storing demand POST error!");
			console.log(err);
		}else{
			// var tempUser = req.user;
			console.log("======================== create demand SUCCSSS: ");

			User.findOne({username:req.user.username}, function(err, foundUser){
				if(err){
					console.log(err);
				}else{

					foundUser.demandPosts.push(newDemand._id);
					foundUser.save(function(err,data){
						if(err){
							console.log("zhuo: new demand save user error");
							console.log(err);
						}else{
							console.log('zhuo: here is the new user data after adding a demand');
							console.log(data);

								// Admin Gary <qingsheh@usc.edu>'
							//sending notification email after saving the new demand
							var data1 = {
							  from: 'Zhuowei Zhang <zhuoweiz@uzespace.com>',
							  to: 'Admin Bob <zhuoweiz@uzespace.com>',
							  subject: '[uze]NewDemand',
							  text: 'Hello from the other side. 张卓玮叫你去接单。。'+data.username
							};

							var receiptant = req.user.username;
							var data2 = {
							  from: 'Zhuowei Zhang <zhuoweiz@uzespace.com>',
							  to: receiptant,
							  subject: '[uze] new demand created',
							  text: 'Hello, this is a notification that you just created a new demand. You can always check the status and information on your account page at uzespace.com'
							};

							console.log("sending mailgun email....");
							mailgun.messages().send(data1, function (error, body) {
						  	// console.log(body);
							});
							mailgun.messages().send(data2, function (error, body) {
						  	// console.log(body);
							});

							//take you to the deposit page.

						}
					});
				}
			});
			res.redirect("/demanded");
			console.log("================== here is the new demand: ==========");
			console.log(newDemand);
			console.log("================== end of the new demand data =======");
		}
	});

//_testing
	
	console.log("后来者");
});

app.get("/demanded", function(req,res){
	res.render("demanded");
});

//----------------create supply
app.get("/supply", isLoggedIn,isActivated, function(req,res){
	res.render("supply");
});

app.post("/supplied", isLoggedIn,isActivated, multer(multerConfig).single('photo'), function(req,res){
	var supply_query = req.body.supply;

	//dealing with input data
	var tempUserEmail = req.user.username;
	supply_query.s_owner = tempUserEmail;
	console.log(" == adding supply... dimention "+ supply_query.s_length,supply_query.s_height);
	//换算
	var product = supply_query.s_length * supply_query.s_height * supply_query.s_width / 6270;
	supply_query.s_unit = (Math.round( product * 100 ) / 100).toFixed(2);
	console.log(" = = = = huansuan: ",product +' - > '+supply_query.s_unit);
	//图片命名id
	var supplyOwnedIdNumber = req.user.supplyPosts.length+1;
	supply_query.s_ownedId = supplyOwnedIdNumber.toString() + tempSupplyPhotoIdType;

	//-----------------need modification
	Sp.create(supply_query, function(err, newSupply){
		if(err){
			console.log("storing supply POST error!");
			console.log(err);
		}else{
			// var tempUser = req.user;
			console.log("======================== create supply SUCCSSS: ");

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

							//sending notification email after saving the new supply
							var data1 = {
							  from: 'Zhuowei Zhang <zhuoweiz@uzespace.com>',
							  to: 'Admin Bob <zhuoweiz@uzespace.com>',
							  subject: '[uzeAdmin]NewSupply',
							  text: 'Hello from the other side. 张卓玮叫你去接单。。'+data.username 
							};

							var receiptant = req.user.username;
							var data2 = {
							  from: 'Zhuowei Zhang <zhuoweiz@uzespace.com>',
							  to: receiptant,
							  subject: '[uze] new supply created',
							  text: 'Hello, this is a notification that you just created a new supply. You can always check the status and information on your account page at uzespace.com'
							};

							console.log("sending mailgun email....");
							mailgun.messages().send(data1, function (error, body) {
						  console.log(body);
							});
							mailgun.messages().send(data2, function (error, body) {
						  console.log(body);
							});
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
			
			// Dm.findById(req.params.id, (err, foundDemand) => {
			// 	//old users who posted uncalculated prices gets this price, so are new users thb
			// 	if(foundDemand.price == 0){
			// 		foundDemand.price = Number(foundDemand.unit[0])*7 + 25;
			// 		console.log('recalculating the price');
			// 	}

			// 	foundDemand.save(function(err){
			// 		if(err){
			// 			console.log("oops => demandpage getting price calculation savint error on payment.js-16");
			// 			console.log(err);
			// 		}else{
			// 			res.render('venmoPay',{foundDemand, foundDemand});
			// 		}
			// 	});
			// });

			res.redirect('/supplied');
		}
	});
});

app.get('/sign-s3', (req, res) => {
  const s3 = new aws.S3();
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];
  const s3Params = {
    Bucket: "uzesupply",
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
});

// ====================== market route ===============
app.get('/market', (req,res)=>{
	Sp.find({}, function(err, supplySet) {
		res.render("market/market", {supplySet:supplySet});
	});
});


app.get("/supplied", function(req,res){
	res.render("supplied");
});

app.get("/emaillist",function(req,res){
	res.redirect('http://keybwarrior.com/undecided/undecided.html');
});

// =========================  OTHER ROUTES ==========
app.get("/feedback", function(req,res){
	res.render("webpages/feedback");
});

app.get('/qna', (req,res)=>{
	res.render("webpages/qna");
});

//---------------------server setup---------------------process.env.PORT,process.env.IP
var port = process.env.PORT || 5000;
app.listen(port,function(){
	console.log("Uze server started");
});