/*
 * Registration Web Response
 * 		extends Web Response
 * Returns the registration page and handles processing of the form results
 * 
 */
//built in modules
const qs = require('querystring');
const fs = require("fs");

//local modules
const WebResponse = require('./web-response.js');
const Accounts = require('./accounts.js');
const Sessions = require('./sessions.js');

//function modules
const parse_cookies = require('./parse_cookies.js');

class LogoutWebResponse extends WebResponse{
	
	constructor(page, file) {
		super(page);
	}
	
	response(req, res){	
		
		//redirect to login page and close this response
		res.setHeader('Set-Cookie', ['session_id=invalid']);
		res.writeHead(302, {'Location': './login.html'});
		res.end();
	}
}

module.exports = LogoutWebResponse;