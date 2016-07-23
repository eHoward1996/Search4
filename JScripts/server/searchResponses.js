// ----------------------------
//	Need to import 'path' module to account for location of this file in
//	relation to others
var path = require('path');

// ----------------------------
//	Path to all imported modules/packages/libraries (npm install ...)
var nPkgDir = path.join(__dirname, '..', 'node_modules/');

// ----------------------------
// Include the async library to make sure all search api calls
// are complete before moving ahead to callbacks
var async = require(path.join(nPkgDir, 'async'));

function getUrbanDefinition(apiVars, callback)	{
	var urban = require(path.join(nPkgDir, '/urban')),
    	query = apiVars.query.includes('#') ? apiVars.query.substring(1) : apiVars.query,
    	def = urban(query);

	def.first(function(json) {
		var definition = "<span style=\'font-weight: bold; font-size: x-large;\'>Sorry, no definition found for " + query + " :/</span>";
		if (json != undefined)	{
			definition = {
				query: json.word,
				def:   json.definition,
				ex:    json.example,
				upVote:json.thumbs_up,
				dnVote:json.thumbs_down,
				link:  json.permalink
			};
		}
	    callback(null, definition);
	});
}


// --------------
// Twitter responses and handlers
function getTwitterResponse(apiVars, callback)  {
	if (!apiVars.mediaToSearch.twitter)	{
		return callback(null);
	}
	var twitter = require(path.join(nPkgDir, '/twit'));
	var t = new twitter(apiVars.twitter);
	  
	var params = {
		q: apiVars.query,
	  	count: apiVars.count
	};

	t.get('search/tweets', params, function(err, data, response) {
		if (err) {
			callback(err, null);
	  	}
	   	else {
			handleTwitterResponse(data, callback);
	  	}
	});
}
function handleTwitterResponse(data, callback)  {
	var twitterResponses = [];
	for (var i = 0; i < data.statuses.length; i++) {
	  	var response = '';
	  	var text = data.statuses[i].text; 
		var hasLink = text.lastIndexOf('https://') > -1;

		if (hasLink)  {
			var link = text.substring(text.lastIndexOf('https://'));
		  	var isFullLink = link.indexOf('...');
		  
		  	if (isFullLink) {
				text = text.substring(0, text.lastIndexOf('https://'));
				response += text + '<br><a href=\'' + link + '\'>Full Post Here</a>'
		 	}
		}
		else {
			response += text; 
		}    

	  	twitterResponses[twitterResponses.length] = response;
	  
		if (i == data.statuses.length - 1) {
			callback(null, twitterResponses)    
	  	}
	}
}

// --------------
// Tumblr responses and handlers
function getTumblrResponse(apiVars, callback)  {
	if (!apiVars.mediaToSearch.tumblr)	{
		return callback(null);
	}
	var tumblr = require(path.join(nPkgDir, '/tumblr.js'));
	var client = tumblr.createClient(apiVars.tumblr);

	var query = apiVars.query.includes('#') ? apiVars.query.substring(1) : apiVars.query;
	client.taggedPosts(query, { limit: apiVars.count }, function (err, resp)  {
		if (err)  {
			callback(err, null);
		}
		else {
			handleTumblrResponse(resp, callback);
		}
	});
}
function handleTumblrResponse(data, callback) {
	var tumblrResponse = [];

	for (i = 0; i < data.length; i++) {
		var response = '';
		var postType = data[i].type;

		if (postType == 'text') {
		  response += data[i].title + ':\n' + data[i].body;
		}
		if (postType == 'video')  {
		  response += data[i].player[data[i].player.length - 1].embed_code;
		}
		if (postType == 'photo')  {
			for (var x = 0; x < data[i].photos.length; x++) {
				var photo = data[i].photos[x].alt_sizes[2];
				response += '<img src=\'' +	photo.url +
							'\' height=\'' + photo.height +
							'\' width=\'' +	photo.width +
							'\'/><br/>';
		  	}
		}

		tumblrResponse[tumblrResponse.length] = response;

	  	if (i == data.length - 1) {
			callback(null, tumblrResponse);
		}
	}
}

// --------------
// Instagram responses and handlers
function getInstaResponse(apiVars, callback) {
	if (!apiVars.mediaToSearch.ig)	{
		return callback(null);
	}
	var ig = require(path.join(nPkgDir, '/instagram-node')).instagram();

	ig.use(apiVars.ig);

	var q = apiVars.query.substring(1);
	ig.tag_media_recent(q, { count: apiVars.count }, function (err, medias, pagination, remaining, limit) {
	  	if (err)  {
			callback(err, null);
	  	}
	  	else {
			handleInstaResponse(medias, callback);
	  	}
	});
}
function handleInstaResponse(data, callback)  {
	var instaResponse = [];

	for (var i = 0; i < data.length; i++)	{
		var response = data[i].caption.text;
		var postType = data[i].type;

		if (postType == 'image')	{
			var image = data[i].images.standard_resolution;
			response += '<img src=\'' + image.url +
						'\' height=\'' + image.height +
						'\' width=\''  + image.width +
						'\'/><br/>';
		}
		if (postType == 'video')	{
			var video = data[i].videos.standard_resolution;
			response += '<video width=\'' + video.width +
						'\' height=\'' + video.height +
						'\' controls><source src=\'' + video.url +
						'\' type=\'video/mp4\'>Well Jack, Looks like you need to upgrade your browser.</video>' 
		}
		instaResponse[instaResponse.length] = response;
		
		if (i == data.length - 1)	{
			callback(null, instaResponse);
		}
	}
}

// --------------
// Google+ responses and handlers
function getGPlusResponse(apiVars, callback)	{
	if (!apiVars.mediaToSearch.gplus)	{
		return callback(null);
	}
	var gPlus = require(path.join(nPkgDir, '/googleapis')).plus('v1');
	var apikey = 'AIzaSyBZU_-9TG2tva6gHOH455yDYbAvl2Cb_d4';
	
	var params = {
		query: apiVars.query,
		maxResults: apiVars.count,
		auth: apiVars.gplus.apiKey
	};

	var req = gPlus.activities.search(params, function (err, response)	{
		if (err)	{
			callback(err, null)
		}
		else {
			handleGPlusResponse(response, callback)
		}
	});
}
function handleGPlusResponse(data, callback)	{
	var gPlusResponse = [];

	for (var i = 0; i < data.items.length; i++)	{
		var response = data.items[i].object.content;
		gPlusResponse[gPlusResponse.length] = response;

		if (i == data.items.length - 1)	{
			callback(null, gPlusResponse);
		}
	} 
}

// --------------
// Reddit responses and handlers
function getRedditResponse(apiVars, callback)	{
	if (!apiVars.mediaToSearch.reddit)	{
		return callback(null);
	}
	var rawjs = require(path.join(nPkgDir, '/raw.js'));
	var reddit = new rawjs('search4 v0.1');
}
function handleRedditResponse(data, callback)	{

	console.log(data);
}

var getSearchResults = function(apiVars, callback)	{
	async.parallel(
		[
			function (callback)	{
				getUrbanDefinition(apiVars, callback);
			},
			function (callback) {  
				getTwitterResponse(apiVars, callback);
			},
			function (callback) {
				getTumblrResponse(apiVars, callback); 
			},
			function (callback)  {
				getInstaResponse(apiVars, callback);
			},
			function (callback)	{
				getGPlusResponse(apiVars, callback);
			},
			function (callback)	{
				getRedditResponse(apiVars, callback);
			}
		],
	function (err, results) {
		results = [].concat.apply([], results);
		callback(err, results);
	});
};

module.exports = getSearchResults;