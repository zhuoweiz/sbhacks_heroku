const express 	= require("express"),
    	payRouter  	= express.Router(),
    	paypal 		= require('paypal-rest-sdk');

paypal.configure({
  'mode': 'live', //sandbox or live
  'client_id': 'AZ5dI6bIGJ60oXzj-4n0dVpMzpGHnx1og3xyv9nMRG7qY4RWv1Jw_wgg_FgIfvr46cAUCG7TblOHjem5',
  'client_secret': 'EC0ocDbg7ghekY0g8uiIqWWGStd_FgFF3L1-TVsaiPb0MHdkw3HUHn5GUFtkwOvdPhvjxIYfE6ueLKLH'
});

payRouter.post('/demand/:demandId',isLoggedIn, isActivated, (req,res) => {
	Dm.findById(req.params.demandId, (err, foundDemand) => {
		//old users who posted uncalculated prices gets this price, so are new users tbh
		
		//if didnt use promo, update price
		if(!req.user.demandpromoUsed){
			var newPrice = foundDemand.unit*0.5+15;
		}

		if(foundDemand.price==0){
			var newPrice = foundDemand.unit*0.5+15;
		}

		var tempPrice = (Math.round( newPrice * 100 ) / 100).toFixed(2);
		foundDemand.price = tempPrice;

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
											foundDemand.price = (Math.round((foundDemand.price-10)*100)/100).toFixed(2);
											data.newPrice = foundDemand.price.toString();
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

payRouter.post('/demand/:demandId/paypal', (req, res) => {
	
	var paypalPrice = '0';
	var create_payment_json = {
	    "intent": "sale",
	    "payer": {
	        "payment_method": "paypal"
	    },
	    "redirect_urls": {
	        "return_url": "http://localhost:5000/payment/success/",
	        "cancel_url": "https://mighty-escarpment-53563.herokuapp.com/payment/cancel/"
	    },
	    "transactions": [{
	        "item_list": {
	            "items": [{
	                "name": "storagebox",
	                "sku": "001",
	                "price": "1",
	                "currency": "USD",
	                "quantity": 1
	            }]
	        },
	        "amount": {
	            "currency": "USD",
	            "total": "1"
	        },
	        "description": "This is the payment description."
	    }]
	};

	Dm.findById(req.params.demandId, (err, foundDemand)=>{
		paypalPrice = foundDemand.price.toString();
		create_payment_json.transactions[0].item_list.items[0].price = paypalPrice;
		create_payment_json.transactions[0].amount.total = paypalPrice;
		create_payment_json.redirect_urls.return_url = "https://mighty-escarpment-53563.herokuapp.com/payment/demand/"+req.params.demandId+"/success/";
		// console.log(' COMING ------- ',create_payment_json.transactions[0].item_list.items[0].price, create_payment_json.transactions[0].amount.total);

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
});

payRouter.get('/demand/:demandId/success/', (req, res)=>{
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;

	var paypalPrice="";
	var execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "1"
        }
    }]
	};

	Dm.findById(req.params.demandId, (err, foundDemand)=>{
		var tempPrice = foundDemand.price;
		paypalPrice = tempPrice.toFixed(2);
		console.log('kill me ',paypalPrice);
		
		execute_payment_json.transactions[0].amount.total = paypalPrice;
		console.log("hehe ==? ", execute_payment_json.transactions[0].amount.total);
		foundDemand.d_payedReserve = true;
		foundDemand.save((err)=>{
			if(err){
				console.log(err);
				console.log('zhuowei ==> oops you failed to save the demand file after successful paypal reserve payment');
			}else{

			}
		});

		paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
	    if (error) {
	        console.log(error.response);
	        throw error;
	    } else {
	        console.log("Get Payment Response");
	        console.log(JSON.stringify(payment));
	        
	        var paymentStatus = true;
	        // res.send('paypal payment success');
	        req.flash('success','You hae successfully made a payment to uze tech Inc.');
	        res.render('payment/paypalshow.ejs', {paymentStatus:paymentStatus, demand: foundDemand});
	    }
		});
	});
});

payRouter.get('/cancel', (req, res)=>{
	var paymentStatus = true;
	// res.send('paypal payment cancelled');
	req.flash('success','Payment ended');
	res.render('payment/paypalshow.ejs', {paymentStatus:paymentStatus})
});

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