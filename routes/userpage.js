var express 	= require("express"),

		router  	= express.Router(),
		Supply		= require('../models/supply');

		// /userpage/

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

//delete demand
router.delete('/:demandId/delete', isLoggedIn, (req,res)=>{
	Dm.findByIdAndRemove(req.params.demandId, (err)=>{
		if(err){
			console.log(err);
			console.log("== oops ==, you failed to delete this demand post")
		}else{
			
		}
	});

	User.findById(req.user.id, (err, foundUser)=>{
		foundUser.demandPosts.pull(req.params.demandId);
		foundUser.save(function(err,data){
			if(err){
				console.log("zhuo: new demand save user error after deleting a demandPosts element");
				console.log(err);
			}else{
				res.redirect('/userpage/'+req.user._id+'/ds');
			}
		});
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