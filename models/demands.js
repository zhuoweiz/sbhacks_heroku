var mongoose = require("mongoose");
var imgPath = "/public/img";

//==================================== DB setup ============
var demandSchema = new mongoose.Schema({
	//required
	college: String,
	usernameF: String,
	usernameL: String,
	d_owner: String,

	number: Number,
	email: String, //wrong number

	starting: String,
	ending: String,
	d_needPickUp: String, // "yes", "maybe", "no"
	
	//checkout flow
	matched: {type: Boolean, default: false},
	d_matchedSupply: {
		type: mongoose.Schema.Types.ObjectId, ref: 'Supply'
	},
	price: {type: Number, default: '0'},
	d_realPrice: {type: Number, default: '0'},
	d_payedReserve: {type: Boolean, default: false},
	closed: {type: Boolean, default: false},

	//size refactor
	unit: Number,
	d_boxes: [{
		type: Object, 
		}],
	length: Number,
	height: Number,
	width: Number,
	special: String,

	//optionals
	code: String,
	weight: String,
	img: { data: Buffer, contentType: String },

	//other
	created: 
		{type: Date, default: Date.now},
	stage: {type: String, default: "0"}, //1-request, 2-matched, 3-payed
});

var Dm = mongoose.model("Demand", demandSchema);

module.exports = Dm;