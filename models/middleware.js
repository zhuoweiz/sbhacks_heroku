const User = require("/models/user");

function isActivated(req, res, next){
	User.findOne({username:req.user.username}, function(err, foundUser){
			if(foundUser.isActivated!='false'){
				return next();
			}
			req.flash('error','Not activated yet');
			res.redirect("/userpage/"+foundUser._id+"/myaccount");
		});
}

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports.isActivated = isActivated(req, res, next);
module.exports.isLoggedIn = isLoggedIn(req, res, next);