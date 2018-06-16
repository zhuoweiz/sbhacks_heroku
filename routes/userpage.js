// /userpage/

var express 	= require("express"),
		router  	= express.Router();

//------------ firebase admin sdk set up
const admin = require('firebase-admin');
const serviceAccount = require("./../ServiceAccountKey.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://uzespaceapi-1516813689822.firebaseio.com"
});

const fireStore = admin.firestore();

		

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

//delete
router.delete('/demand/:demandId/delete', isLoggedIn, (req,res)=>{
	Dm.findById(req.params.demandId, (err, foundDemand)=>{
		if(foundDemand.matched){
			Sp.findById(foundDemand.d_matchedSupply, (err, foundSupply)=>{
				if(foundSupply.s_matchedDemandPosts){
					foundSupply.s_matchedDemandPosts.pull(req.params.demandId);
				}
				else{
					console.log("zhuowei => u try to delete this demand, and no supply has recorded this demand you want to delete")
				}
			});
		}
	});

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

router.delete('/supply/:supplyId/delete', isLoggedIn, (req,res)=>{
	Sp.findById(req.params.supplyId, (err, foundSupply)=>{
		if(err){console.log(err)}
		foundSupply.s_matchedDemandPosts.forEach((demandId)=>{
			Dm.findById(demandId, (err,foundDemand)=>{
				if(err){console.log(err);}
				if(foundDemand.matched){
				  foundDemand.matched = false;
				  foundDemand.d_matchedSupply = null;
				}else{
					foundDemand.matched = false;
				  foundDemand.d_matchedSupply = null;
					console.log('something wrong with deleting matchedSupply in demand post when deleting supply post');
				}
			});
		});
	});

	Sp.findByIdAndRemove(req.params.supplyId, (err)=>{
		if(err){
			console.log(err);
			console.log("== oops ==, you failed to delete this supply post");
		}else{
			
		}
	});

	User.findById(req.user.id, (err, foundUser)=>{
		foundUser.supplyPosts.pull(req.params.supplyId);
		foundUser.save(function(err,data){
			if(err){
				console.log("zhuo: new supply save user error after deleting a supplyPosts element");
				console.log(err);
			}else{
				res.redirect('/userpage/'+req.user._id+'/ss');
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