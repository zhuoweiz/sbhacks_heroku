const express 	= require("express"),
    	payRouter  	= express.Router(),
    	paypal 		= require('paypal-rest-sdk');

paypal.configure({
  'mode': 'live', //sandbox or live
  'client_id': 'AZ5dI6bIGJ60oXzj-4n0dVpMzpGHnx1og3xyv9nMRG7qY4RWv1Jw_wgg_FgIfvr46cAUCG7TblOHjem5',
  'client_secret': 'EC0ocDbg7ghekY0g8uiIqWWGStd_FgFF3L1-TVsaiPb0MHdkw3HUHn5GUFtkwOvdPhvjxIYfE6ueLKLH'
});

payRouter.get('/', (req,res) => {
	res.render('venmoPay');
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

module.exports = payRouter;