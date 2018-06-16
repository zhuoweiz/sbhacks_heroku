var express 	= require("express"),
    router  	= express.Router(),
    
    passport 	= require("passport"),
    GoogleStrategy = require("passport-google-oauth").OAuthStrategy,
    async 		= require("async"),
    crypto 		= require("crypto"),
    nodemailer 	= require("nodemailer"),
    User 		= require("../models/user");

//env configurations
var api_key = process.env.MAILGUN_API_KEY;
var domain = process.env.MAILGUN_API_DOMAIN;
const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

require('dotenv').config();

function activateFunc(req,res,next){
	async.waterfall([
		function(done){
			crypto.randomBytes(20, function(err, buf){
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		function(token, done){
			User.findOne({ username: req.user.username }, function(err, user){
				if(!user){
					console.log('No account with that email address exists.');
					req.flash('error', 'No account with that email address exists.');
					return res.redirect('/signup');
				}

				user.activationToken = token;
				user.activationExpires = Date.now() + 3000000; // 30 min

				user.save(function(err){
					done(err, token, user);
				});
			});
		},
		function(token, user, done){

			// var receiptant = req.user.username;
			var data2 = {
			  from: 'Zhuowei Zhang <zhuoweiz@uzespace.com>',
			  to: user.username,
			  subject: '[Uzespace] Account Activation',
			  text: 'Activate your account and become a proud uzer today!!!' +
					'Click on the link below or paste it to the browser to proceed: ' +
					'http://' + req.headers.host + '/activate/' + token +'\n\n' +
					' Activation link expires after 30 minutes. You can always request another one in the account page at uzespace.com . If you didnt request this, please ignore this email'
			};
			mailgun.messages().send(data2, function (err, body) {
				console.log('activation email sent: ');
			  console.log(body);
			  req.flash('success', 'An email has been sent to ' + user.username + ' for activation purposes.');
				done(err, 'done');
			});

		}
	], function(err) {
		if (err) return next(err);
		// req.flash('error','sorry but activation is not successful -3');
		res.redirect('/');
		console.log("test");
	});
}

// ----------------------------------------------------------
// ---------------------  AUTH ROUTES SETUP -----------------
// ----------------------------------------------------------
router.get("/signup", function(req,res){
	res.render("signup");
});

router.post("/signup", function(req,res,next){
	var newUser = new User({username: req.body.username, displayName: req.body.displayName});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			req.flash('error','Sorry, but the email is already used for the account, pls contact customer service for further assistance');
			return res.redirect("signup");
		}
		passport.authenticate("local")(req,res,function(){
			console.log("register success!");
			// res.redirect('/');
			activateFunc(req,res,next);
		});
	});
});

router.post('/sendActivation', function(req,res,next){
	User.findOne({username:req.user.username}, function(err, foundUser){
		if(!err){
			console.log('userfind in send activation post request: ',foundUser);
			activateFunc(req,res,next);
		}
	});
});

router.get('/activate/:token', function(req,res){
	User.findOne({ activationToken: req.params.token, activationExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Activation token is invalid or expired.');
      return res.redirect('/forgot');
    }else{
    	
    }
    // console.log('successful get activation request: date now: ', Date.now());
    res.render('user/activation', {token: req.params.token});
  });
});

router.post('/activate/:token', function(req,res,next){
	async.waterfall([
    function(done) {
      User.findOne({ activationToken: req.params.token, activationExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Activation token is invalid or has expired.');
          // console.log('successful get activation request: date now: ',Date.now());
          return res.redirect('/');
        }
        console.log("aha1:" , user);
        user.activationToken = undefined;
        user.activationExpires = undefined;
        user.isActivated = 'true';
        console.log("aha2:" , user);

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) 
    {
			var activateSuccessEmail = {
				from: 'Zhuowei Zhang <zhuoweiz@uzespace.com>',
				to: user.username,
				subject: '[uzespace]Account Activation',
				text: 'Hello,\n\n' +
	   			     'This is a confirmation that your account ' + user.username + ' has just been activated.\n'
			};

			console.log("sending new account activation mailgun email....");
			mailgun.messages().send(activateSuccessEmail, function (error, body) {
		  	// console.log(body);
		  	done(error, 'done');
			});
	  }
	  ], function(err) {
	  	if (err) return next(err);

			res.redirect('/');
			req.flash('success', 'You just activated your account!');
			console.log("activation success");
	  });
});

router.get("/login", function(req,res){
	res.render("login",{page: 'login'});
});

router.post("/login", passport.authenticate("local",{
	successRedirect: "/",
	failureRedirect: "/login",
	failureFlash: true,
    successFlash: 'Welcome to Uze!'
}), function(req,res){
});

router.get("/logout", function(req,res){
	req.logout();
	req.flash('success', "see you later!");
	res.redirect("/");
});

router.get('/forgot', function(req,res){
	res.render('forgot');
});

router.post('/forgot', function(req, res, next){
	async.waterfall([
		function(done){
			crypto.randomBytes(20, function(err, buf){
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		function(token, done){
			User.findOne({ username: req.body.username }, function(err, user){
				if(!user){
					console.log('No account with that email address exists.');
					req.flash('error', 'No account with that email address exists.');
					return res.redirect('/forgot');
				}

				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 600000; // 10 min

				user.save(function(err){
					done(err, token, user);
				});
			});
		},
		function(token, user, done){

			var forgotEmail = {
				from: 'Zhuowei Zhang <zhuoweiz@uzespace.com>',
				to: user.username,
				subject: '[uzespace]Password Reset Request',
				text: 'please click on the link below or paste it to the browser to proceed' +
					' http://' + req.headers.host + '/reset/' + token +'\n\n' +
					'if you didnt request this, please ignore this email'
			};

			console.log("sending new account activation mailgun email....");
			mailgun.messages().send(forgotEmail, function (error, body) {
		  	// console.log(body);
		  	console.log('forgot request email sent');
		  	req.flash('success', 'An email has been sent to ' + user.username + ' with further instructions.');
				done(error, 'done');
			});
		}
	], function(err) {
		if (err) return next(err);
		res.redirect('/forgot');
		console.log("test");
	});
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('pwReset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
			var pwResetConfirmEmail = {
			from: 'Zhuowei Zhang <zhuoweiz@uzespace.com>',
			to: user.username,
			subject: '[uzespace]Password Reset Success',
			text: 'Hello, This is a confirmation that the password for your account has just been changed. Reply if you have further questions.'
			};

			console.log("sending activation confirmation mailgun email....");
			mailgun.messages().send(pwResetConfirmEmail, function (error, body) {
	  		// console.log(body);
	  		console.log('pw reset confirmation email sent');
	  		req.flash('success', 'An confirmation email has been sent to ' + user.username + '.');
				done(error, 'done');
			});
    }
  ], function(err) {

    res.redirect('/');
  });
});

//activation email


module.exports = router;
