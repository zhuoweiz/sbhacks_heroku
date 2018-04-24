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
	supplier: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	supply: {type: mongoose.Schema.Types.ObjectId, ref: 'Supply'},
	price: {type: Number, default: '0'},
	d_realPrice: {type: Number, default: '0'},
	payed: {type: Boolean, default: false},
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
		{type: Date, default: Date.now}
});

var Dm = mongoose.model("Demand", demandSchema);

module.exports = Dm;