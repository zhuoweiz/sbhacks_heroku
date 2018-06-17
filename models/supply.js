var mongoose = require("mongoose");
var imgPath = "/public/img";

//==================================== DB setup ============
var supplySchema = new mongoose.Schema({
	//required
	s_college: String,
	s_usernameF: String,
	s_usernameL: String,
	s_owner: String,
  s_ownedId: String, //idnumber + .type
  s_photoUrl: String,
  s_photoUrlSet: [{type:String}], //urls of ph

	s_number: Number,
	s_email: String,
	s_postcode: String,
	s_street: String,

	s_unit: Number,
	s_length: Number,
	s_height: Number,
	s_width: Number,
	
	s_starting: String,
	s_ending: String,
	s_description: String,
	s_willingToDrive: 
		{type: String, default: "maybe"}, // "yes", "maybe", "no"

	//checkout flow
	s_matchedDemandPosts:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Demand'
	}],

	//optional
	s_code: String,
	s_special: String,

	//other
	s_created: 
		{type: Date, default: Date.now}
});

var Sp = mongoose.model("Supply", supplySchema);

module.exports = Sp;