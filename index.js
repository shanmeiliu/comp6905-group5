/**
 * 
 */

var url = require('url'),
http = require("http"),
path = require("path"),
url = require("url"),
fs = require("fs");



const hostname = '127.0.0.1';
const port = 8080;

const WebResponse = require('./web-response.js');
const staticWebResponse = require('./static-web-response.js');
const RegistrationWebResponse = require('./registration-web-response.js'); 
const Accounts = require('./accounts.js');


var pages = [];

pages.push( new RegistrationWebResponse("./register.html"));

pages.push( new staticWebResponse("./style.css","./static/style.css"));
pages.push( new staticWebResponse("./favicon.ico","./static/favicon.ico"));
pages.push( new staticWebResponse("./index.html","./static/index.html"));
pages.push( new staticWebResponse("./","./static/index.html"));

//voter pages
pages.push( new staticWebResponse("./voter.html","./static/voter.html"));
pages.push( new staticWebResponse("./vote.html","./static/vote.html"));
pages.push( new staticWebResponse("./voterthankyou.html","./static/voterthankyou.html"));
pages.push( new staticWebResponse("./directions_polling_station.html","./static/directions_polling_station.html"));
pages.push( new staticWebResponse("./election_results.html","./static/election_results.html"));

//election commision pages
pages.push( new staticWebResponse("./admin.html","./static/admin.html"));
pages.push( new staticWebResponse("./new_election.html","./static/new_election.html"));
pages.push( new staticWebResponse("./new_election_result.html","./static/new_election_result.html"));

//party pages
pages.push( new staticWebResponse("./party.html","./static/party.html"));
pages.push( new staticWebResponse("./party_enroll.html","./static/party_enroll.html"));

//Candidate pages
pages.push( new staticWebResponse("./candidate.html","./static/candidate.html"));

const server = http.createServer((req, res) => {
	var q = url.parse(req.url, true);
	var filename = "." + q.pathname;

	var hit = false;
	var pageLength = pages.length;
	for (i = 0; i < pageLength; i++) {
		if(pages[i].check_hit(filename)){
			hit = true;

			pages[i].response(req, res);
			break;
		}
	}
	if(!hit){
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		res.end('Hello World\n');
	}
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});