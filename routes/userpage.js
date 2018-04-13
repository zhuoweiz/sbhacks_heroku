var express 	= require("express"),

		router  	= express.Router(),
		Supply		= require('../models/supply');

//get user page
router.get("/:id/myaccount",isLoggedIn, function(req,res){
	
	User.findById(req.params.id).populate("supplyPosts").exec(function(err,thisUser){
		if(err){
			console.log(err);
		}
		else{
			res.render("myaccount", {thisUser:thisUser});
		}
	});
});

router.get('/:id/ss', isLoggedIn, function(req,res){

	User.findById(req.params.id).populate("supplyPosts").exec(function(err,thisUser){
		if(err){
			console.log(err);
		}
		else{
			res.render('./user/userSupply',{thisUser,thisUser});
		}
	});
});

router.get('/:id/ds', isLoggedIn, function(req,res){

	User.findById(req.params.id).populate("demandPosts").exec(function(err,thisUser){
		if(err){
			console.log(err);
		}
		else{
			res.render('./user/userDemand',{thisUser,thisUser});
		}
	});
});

router.get('/payment/success', isLoggedIn, function(req,res){
	res.send('<h1>payment success</h1>');
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

function isActivated(req, res, next){
	User.findOne({username:req.user.username}, function(err, foundUser){
			if(foundUser.isActivated!='false'){
				return next();
			}
			req.flash('error','Not activated yet');
			res.redirect("/userpage/:id/myaccount");
		});
}

module.exports = router;