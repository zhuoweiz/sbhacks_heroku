const express 	= require("express"),
    	payRouter  	= express.Router(),
    	paypal 		= require('paypal-rest-sdk');

paypal.configure({
  'mode': 'live', //sandbox or live
  'client_id': 'AZ5dI6bIGJ60oXzj-4n0dVpMzpGHnx1og3xyv9nMRG7qY4RWv1Jw_wgg_FgIfvr46cAUCG7TblOHjem5',
  'client_secret': 'EC0ocDbg7ghekY0g8uiIqWWGStd_FgFF3L1-TVsaiPb0MHdkw3HUHn5GUFtkwOvdPhvjxIYfE6ueLKLH'
});

payRouter.post('/demand/:id',isLoggedIn, isActivated, (req,res) => {
	Dm.findById(req.params.id, (err, foundDemand) => {
		//old users who posted uncalculated prices gets this price, so are new users thb
		if(foundDemand.price == 0){
			foundDemand.price = Number(foundDemand.unit[0])*7 + 25;
			console.log('recalculating the price');
		}

		foundDemand.save(function(err){
			if(err){
				console.log("oops => demandpage getting price calculation savint error on payment.js-16");
				console.log(err);
			}else{
				res.render('venmoPay',{foundDemand, foundDemand});
			}
		});
	});
});

payRouter.post('/:demandId/promo', (req,res)=>{

	let promo = req.body.promocode;
	let promoInvitor = promo.substring(0,promo.length-4);
	// console.log('tested: ',promoInvitor);

	let data = {
		self: '-1',
		found: '-1',
		used: '-1',
		added: '-1',
		newPrice: '10'
	};

	//invitor cant be self
	if((req.user.username!=promoInvitor)){
		data.self = '0';
		//invitor has to be found in the db
		User.findOne({username: promoInvitor}, (err, foundInvitor)=>{
			if(err){
				console.log(err);
			}else if(foundInvitor){
				data.found = '1';
				
				User.findById(req.user._id, (err, foundInvitee)=>{
					//check if used promo before
					if(foundInvitee.demandpromoUsed){
						data.used = '1';
						res.send(data);
					}else{
						foundInvitee.demandpromoUsed = true;
						foundInvitee.save((err)=>{
							if(err){
								console.log("opps => promocode validation error caused in saving invitee with updating promousage status");
								console.log(err);
							}else{
								data.used = '0';

								//add one for invitor
								foundInvitor.timeReferred += 1;
								foundInvitor.save((err)=>{
									if(err){
										console.log("opps => promocode validation error caused in saving invitor new timeRefered");
										console.log(err);
									}else{
										data.added = '1';
										Dm.findById(req.params.demandId, (err, foundDemand)=>{

											foundDemand.price = foundDemand.price-10;
											data.newPrice = foundDemand.price.toString()+'.00';
											console.log("price price price: ",foundDemand.price);
											foundDemand.save((err)=>{
												if(err){
													console.log("opps => promocode cutting 10 dollars to this demand order saving error");
													console.log(err);
												}else{
													console.log("promocode working");
													res.send(data);
												}
											});
										});
									}
								});
							}
						});
					}
				});
			}else{
				data.found ='0';
				res.send(data);
			}
		});
	}else{
		data.self = '1';
		res.send(data);
	}

	//no more promo can be used
	
});

payRouter.get('/ajaxtest', (req,res)=>{
	console.log("ajax-node working: ----- ----- ---");

	var data = {
		name: 'bob',
		girlfriend: 'zoe'
	};

	res.send(data);
});

payRouter.post('/:id/buy', (req, res) => {
	var create_payment_json = {
	    "intent": "sale",
	    "payer": {
	        "payment_method": "paypal"
	    },
	    "redirect_urls": {
	        "return_url": "http://localhost:5000/payment/success/",
	        "cancel_url": "http://localhost:5000/payment/cancel/"
	    },
	    "transactions": [{
	        "item_list": {
	            "items": [{
	                "name": "item",
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
	}


	paypal.payment.create(create_payment_json, function (error, payment) {
	    if (error) {
	        throw error;
	    } else {
	    		for(var i=0;i<payment.links.length;i++){
	    			if(payment.links[i].rel==='approval_url'){
	    				res.redirect(payment.links[i].href);
	    			}
	    		}
	        // console.log("Create Payment Response");
	        // console.log(payment);
	        // res.redirect('/payment/success');
	    }
	});
});

payRouter.get('/success',(req, res)=>{
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;

	var execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "14.00"
        }
    }]
	};

	paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log("Get Payment Response");
        console.log(JSON.stringify(payment));
        
        res.send('success');
    }
	});
});

payRouter.get('/cancel/:token', (req, res)=>{
	res.send('cancelled');
})

//middle wares
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

module.exports = payRouter;