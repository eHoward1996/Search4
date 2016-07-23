// ----------------------------
//	Need to import 'path' module to account for location of this file in
//	relation to others
var path = require('path');
// ----------------------------
//	Path to all imported modules/packages/libraries (npm install ...)
var nPkgDir = path.join(__dirname, '..', 'node_modules/');
//	Path to 'Views'
var views = path.join(__dirname, '..', '..', 'Views/');
//	Path to 'Styles'
var styles = path.join(__dirname, '..', '..', 'Styles/');

// ----------------------------
//	Import NodeJS Express library
var express = require(path.join(nPkgDir, 'express'));
var s4 = express();

// ----------------------------
//	Import social media search variables (includes count)
var apiVars = require('./apiconfig.js');

// ----------------------------
//	Import file paths that need to be used by the UI
var pug = require(path.join(nPkgDir, 'pug'));
//		Set 'view engine' for the app to 'pug'
//		The view engine is what renders views
s4.set('view engine', pug);
//		Set 'views' property to the path to Views folder
s4.set('views', views);
//		Use the path to the Stylesheets
s4.use(express.static(styles));

// ----------------------------
//	Start the Server
s4.listen(8080, function()  {
	console.log('Search 4 running on port 8080');
});

// ----------------------------
s4.get('/', function(req, res)  {
	var trends = require('./trends.js');

	trends(apiVars, function (err, results)	{
		var html = '';
		var pugOptions = {pretty: true};
		var pugRenderParams = { trends: [err] };

		var compilePug = pug.compileFile(path.join(views, 'index.pug'), pugOptions);
		if (!err)	{
			var topTrends = [];
			for (var i = 0; i < 10; i++)	{
				topTrends.push({
					name: results[i].name,
					query: results[i].query
				});
			}
			pugRenderParams = { trends: topTrends };
		}

		html = compilePug(pugRenderParams);
		res.end(html);
	});
});

s4.get('/search4', function(req, res)   {
	apiVars.query = req.query.q;

	function getDefinition(defObject)	{
		return  defObject !== undefined && defObject.query !== undefined ?
				'<a href=\'' + defObject.link + '\' id=\'queryLink\'>' +
				defObject.query + '</a>' +
				'<br/><br/>' + defObject.def +
				'<br/><br/><span id=\'ex\'>Example in Context</span><br/>' +
				defObject.ex + '<br/><br/>Definition has <b>' +
				defObject.upVote + ' up votes</b> and <b>' +
				defObject.dnVote + ' down votes</b> on Urban Dictionary.' : defObject;
	}

	function shuffle(results)	{
		var copy = [], n = results.length, i;

		while (n)	{
			i = Math.floor(Math.random() * results.length);
			if (i in results) {
				copy.push(results[i]);
				delete results[i];
				n--;
			}
  		}
  		for (i = 0; i < copy.length; i++)	{
  			if (copy[i] == '' || copy[i] === undefined)	{
  				delete copy[i];
  			}
  		}
		return copy;
  	}	

	var search = require('./searchResponses.js');
	search(apiVars, function (err, results)	{
		var html = '';
		var pugOptions = {pretty: true};
		var pugRenderParams = { 
			query: 	   apiVars.query,
			def:       getDefinition(results.shift()),
			responses: shuffle(results),
		};

		var compilePug = pug.compileFile(path.join(views, 'search4.pug'), pugOptions);
		if (err)	{
			pugRenderParams = {	
				query: apiVars.query,
				responses: [err]
			};
		}

		html = compilePug(pugRenderParams);
		res.end(html);
  	});
});