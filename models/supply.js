var mongoose = require("mongoose");
var imgPath = "/public/img";

//==================================== DB setup ============
var supplySchema = new mongoose.Schema({
	//required
	s_college: String,
	s_usernameF: String,
	s_usernameL: String,
	s_number: Number,
	s_email: String,
	s_postcode: String,
	s_street: String,
	s_unit: String,
	s_starting: String,
	s_ending: String,
	s_description: String,
	s_willingToDrive: {type: String, default: "maybe"}, // "yes", "maybe", "no"

	//checkout flow

	//optional
	s_code: String,
	s_length: String,
	s_height: String,
	s_width: String,
	s_special: String,
	s_img: { data: Buffer, contentType: String },

	//other
	s_created: 
		{type: Date, default: Date.now}
});

var Sp = mongoose.model("Supply", supplySchema);

module.exports = Sp;