// function requestMapLocation(){
// 	var formData = {
// 	  'homeMobileCountryCode' : 310
// 	};

// 	// JSON.stringify(formData);
	
// 	var options = {
// 	  uri: 'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyDmnNAnAymv6aHy1S48ABCJNc9DV-F3vtk',
// 	  method: 'POST',
// 	  json: true,
// 	  body: formData
// 	};

// 	request(options, function (err, httpResponse, body) {
// 	  if (!err && httpResponse.statusCode == 200) {
// 	      // var info = JSON.parse(body);
// 	      var thisLocation = {
// 					param1:body.location.lat,
// 					param2:body.location.lng
// 				}
// 	      // console.log(typeof body.location.lat);
// 	      // console.log(typeof body.location.lng);
	     	
// 	     	// console.log('function output: ',thisLocation );
// 				return thisLocation;

// 	  } else {
// 	      console.log('err: ',err);
// 	      // console.log('res: ', httpResponse);
// 	      console.log('body: ',body);

// 	      var thisLocation = {
// 					param1:'34',
// 					param2:'-118'
// 				}
// 				console.log('function output: ',thisLocation );
// 				return thisLocation;
// 	  }
// 	});
// }

// module.exports.haha = requestMapLocation();
