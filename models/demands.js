var mongoose = require("mongoose");
var imgPath = "/public/img";

//==================================== DB setup ============
var demandSchema = new mongoose.Schema({
	//required
	college: String,
	usernameF: String,
	usernameL: String,
	number: Number,
	email: String,
	unit: String,
	starting: String,
	ending: String,

	//optional
	code: String,
	weight: String,
	length: String,
	height: String,
	width: String,
	special: String,
	img: { data: Buffer, contentType: String },

	//other
	created: 
		{type: Date, default: Date.now}
});

var Dm = mongoose.model("Demand", demandSchema);

module.exports = Dm;