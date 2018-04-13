var mongoose = require("mongoose");

//==================================== DB setup ============
var supplySchema = new mongoose.Schema({

	o_demander: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},

	o_supplier: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}

	o_supply: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Supply'
	},
	o_demand: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Demand'
	},

	o_price: {type: String, default: '0'},
	o_payed: {type: Boolean, default: false},

	o_created: {type: Date, default: Date.now}
});

var Or = mongoose.model("Order", supplySchema);

module.exports = Or;