
module.exports = function(){
	
	var data = {
	  from: 'Zhuowei Zhang <zhuoweiz@uzespace.com>',
	  to: 'zhuoweiz@usc.edu',
	  subject: 'Hello',
	  text: 'Hello from the other side (mailgun)'
	};

	console.log("sending mailgun email....");
	mailgun.messages().send(data, function (error, body) {
  console.log(body);
	});
}
