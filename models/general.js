var mongoose = require("mongoose");

//==================================== DB setup ============
var generalSchema = new mongoose.Schema({

	pricePerUnit: {type: Number, default: 7};

});

var Ge = mongoose.model("General", generalSchema);

module.exports = Ge;