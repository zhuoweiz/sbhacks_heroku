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

    //activation
    activationToken: String,
    activationExpires: Date,
    isActivated: {type: String, default: 'false'} ,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    //promocode
    demandpromoUsed: {type: Boolean, default: false},
    promocode: String,
    

    isSupplier: {type: Boolean, default: false},
    verifiedSupplier: {type: Boolean, default: false},
    

    //data association
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],

    supplyPosts: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Supply'
	}],

	demandPosts: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Demand'
	}],

	//other
	s_created: 
		{type: Date, default: Date.now}
}
,{usePushEach: true}
);

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);