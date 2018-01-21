//dependencies
var express = require("express"),
	bodyParser = require("body-parser"),
	request = require("request"),
	methodOverride = require("method-override"),
	app = express(),
	mongoose = require("mongoose");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(methodOverride("_method"));

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://127.0.0.1:27017/uzeDB");

//==================================== DB setup ============
//---------------------------- models
var Dm = require("./models/demands");
var Sp = require("./models/supply");

//==================================== Routes =================
app.get("/", function(req,res){
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


//---------------------server setup---------------------
app.listen(3000,function(){
	console.log("Uze server started");
});