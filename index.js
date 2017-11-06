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
const staticWebResponse = require('./web-response-static.js');
const RegistrationWebResponse = require('./web-response-registration.js'); 
const LoginWebResponse = require('./web-response-login.js'); 
const MenuWebResponse = require('./web-response-menu.js');
const ElectionCreateWebResponse = require('./web-response-election-create.js');
const PartyRegisterWebResponse = require('./web-response-party-register.js');
const VoterVoteWebResponse = require('./web-response-voter-vote.js');
const CandidateRegisterWebResponse = require('./web-response-candidate-register.js');


const Accounts = require('./accounts.js');


var pages = [];


pages.push( new MenuWebResponse("./menu.html"));
pages.push( new MenuWebResponse("./index.html"));
pages.push( new MenuWebResponse("./"));

pages.push( new LoginWebResponse("./login.html"));
pages.push( new RegistrationWebResponse("./register.html"));

pages.push( new ElectionCreateWebResponse("./election_create.html"));
pages.push( new PartyRegisterWebResponse("./nominate_party.html"));
pages.push( new VoterVoteWebResponse("./election_vote.html"));
pages.push( new CandidateRegisterWebResponse("./election_register_candidate.html"));

pages.push( new staticWebResponse("./style.css","./static/style.css"));
pages.push( new staticWebResponse("./favicon.ico","./static/favicon.ico"));
pages.push( new staticWebResponse("./index.html","./static/index.html"));


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