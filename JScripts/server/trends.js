// ----------------------------
//	Need to import 'path' module to account for location of this file in
//	relation to others
var path = require('path');

// ----------------------------
//	Path to all imported modules/packages/libraries (npm install ...)
var nPkgDir = path.join(__dirname, '..', 'node_modules/');

function getTwitterTrends(apiVars, callback)  {
	var twitter = require(path.join(nPkgDir, '/twit'));
	var t = new twitter(apiVars.twitter);
	  
	var params = {
		id: 23424977 // USA WOEID (Where On Earth ID)
	};

	t.get('trends/place', params, function(err, data, response) {
		if (err) {
			callback(err, null);
	  	}
	   	else {
			callback(null, data[0].trends);
	  	}
	});
}

module.exports = getTwitterTrends;