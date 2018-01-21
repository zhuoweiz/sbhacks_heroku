//dependencies
var express = require("express"),
	bodyParser = require("body-parser"),
	request = require("request"),
	methodOverride = require("method-override"),
	app = express(),
	// $ = require("jquery"),
	mongoose = require("mongoose");

//own files
var notes = require("./others.js");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(methodOverride("_method"));

//==================================== DB setup ============
mongoose.Promise = global.Promise;
var uri = "mongodb://xianhomedroy:19980110.Zz@ds046267.mlab.com:46267/uzedb";
mongoose.connect(uri);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//---------------------------- models
var Dm = require("./models/demands");
var Sp = require("./models/supply");


//=============================== others =====
// request('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCXgzdvX_NggJZqfYKEceahh2do7zED09c', function(err, response, body){
// 	var parsedData = JSON.parse(body);

// 	if(response.statusCode == 200) {     //things worked     console.log(body);
//   		console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//   		console.log('Sunset at Huwaii is at :', parsedData["homeMobileCountryCode"]); 
//   	}
// });

//==================================== Routes =================
app.get("/", function(req,res){
	//map request


	res.render("index");
});

//---------------demand
app.get("/demand", function(req,res){
	res.render("demand");
});

app.post("/demanded", function(req,res){
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
app.get("/supply", function(req,res){
	res.render("supply");
});

app.post("/supplied", function(req,res){
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

// =========================  MAP REQUEST ==============


//---------------------server setup---------------------
app.listen(process.env.PORT,process.env.IP,function(){
	console.log("Uze server started");
});