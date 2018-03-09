var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    // username: {type: String, unique: true},
    displayName: String,
    username: {type: String, unique: true, required: true},
    password: String,
    avatar: String,
    firstName: String,
    lastName: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, default: false},


    //data association
    supplyPosts: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Supply'
	}],

	demandPosts: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Demand'
	}]

	//other
	s_created: 
		{type: Date, default: Date.now}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);