var express 	= require("express"),
		paypal 		= require('paypal-rest-sdk'),
		router  	= express.Router(),
		Supply		= require('../models/supply');

paypal.configure({
  'mode': 'live', //sandbox or live
  'client_id': 'AZ5dI6bIGJ60oXzj-4n0dVpMzpGHnx1og3xyv9nMRG7qY4RWv1Jw_wgg_FgIfvr46cAUCG7TblOHjem5',
  'client_secret': 'EC0ocDbg7ghekY0g8uiIqWWGStd_FgFF3L1-TVsaiPb0MHdkw3HUHn5GUFtkwOvdPhvjxIYfE6ueLKLH'
});


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

//== payment route
router.post('/demo/checkout/api/paypal/payment/create/', isLoggedIn, function(req,res){
	var create_payment_json = {
	    "intent": "sale",
	    "payer": {
	        "payment_method": "paypal"
	    },
	    "redirect_urls": {
	        "return_url": "http://www.google.com",
	        "cancel_url": "http://www.baidu.com"
	    },
	    "transactions": [{
	        "item_list": {
	            "items": [{
	                "name": "storageTest",
	                "sku": "item",
	                "price": "14.00",
	                "currency": "USD",
	                "quantity": 1
	            }]
	        },
	        "amount": {
	            "currency": "USD",
	            "total": "14.00"
	        },
	        "description": "This is the payment description."
	    }]
	};


	paypal.payment.create(create_payment_json, function (error, payment) {
	    if (error) {
	        throw error;
	    } else {
	        console.log("Create Payment Response");
	        console.log(payment);
	    }

	    res.render("checkout");
	});
})

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;