const path = require("path");
const fs = require("fs");


const WebResponse = require('./web-response.js');

//maps file extention to MIME typere
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

module.exports = staticWebResponse;