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
	
	async response(req, res){		
		//Redirect to login if not logged i
		var cookies = parse_cookies(req);
		
		if( cookies.hasOwnProperty('session_id')){
			//confirm there is an open session
			var check = await Sessions.check_session( cookies.session_id );  
			if(!check){
				//redirect to login page and close this response
				console.log("Session ID invalid")
				res.writeHead(302, {'Location': './login.html'});
				res.end();
				return false;
			} else {
				//removes it
				await Sessions.remove_session( cookies.session_id );	
			}
		}
		
		//redirect to login page and close this response
		res.setHeader('Set-Cookie', ['session_id=invalid']);
		res.writeHead(302, {'Location': './login.html'});
		res.end();
	}
}

module.exports = LogoutWebResponse;