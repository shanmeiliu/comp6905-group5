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

// maps file extention to MIME typere
const ext_map = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword'
};

class WebResponse {
	constructor(page) {
		this.page = page;
	}

	check_hit(page){
		return(this.page == page)
	}
	response(req, res) {
	}
}

class staticWebResponse extends WebResponse{

	constructor(page, file) {
		super(page);
		this.file = file;

	}
	
	response(req, res){
		var content_type = ext_map[path.parse(this.file).ext];
		  fs.readFile(this.file, function(err, data ) {
			    res.writeHead(200, {'Content-Type': content_type});
			    res.write(data);
			    res.end();
			  })
	}

}


var pages = [];
pages.push(new staticWebResponse("./style.css","./static/style.css"));
pages.push( new staticWebResponse("./index.html","./static/index.html"));
pages.push( new staticWebResponse("./","./static/index.html"));

pages.push( new staticWebResponse("./voter.html","./static/voter.html"));
pages.push( new staticWebResponse("./vote.html","./static/vote.html"));
pages.push( new staticWebResponse("./voterthankyou.html","./static/voterthankyou.html"));
pages.push( new staticWebResponse("./directions_polling_station.html","./static/directions_polling_station.html"));

pages.push( new staticWebResponse("./party.html","./static/party.html"));
pages.push( new staticWebResponse("./party_enroll.html","./static/party_enroll.html"));
pages.push( new staticWebResponse("./new_election.html","./static/new_election"));
pages.push( new staticWebResponse("./election_results.html","./static/election_results.html"));
pages.push( new staticWebResponse("./candidate.html","./static/candidate.html"));
pages.push( new staticWebResponse("./admin.html","./static/admin.html"));

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