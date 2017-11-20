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


//HTML Responses declared here 
var success_message = `
<p>User Login Succesfully <a href=\"./index.html\"> click here to do stuff</a></p>`;

var failure_message = `
	<p>Login Failed</p>`;

var login_form = `
<p><form action=\"" + this.page + "\" method=\"POST\">

	<input type="hidden" name="election_create" value="true">
	<input type=\"hidden\" name=\"login\" value=\"true\">
	<label for=\"username\">Username:</label><input type=\"text\" name=\"username\"> <br />
	<label for=\"password\">Password:</label><input type=\"password\" name=\"password\"> <br />
	<input type=\"submit\" value=\"Submit\">
</form></p>
<p><a href='./register.html'>Need an account? Register here.</a></p>`;


class LoginWebResponse extends WebResponse{
	
	constructor(page, file) {
		super(page);
	}
	
	response(req, res){		
		if(req.method === "POST")
		{
			var body = '';
			req.on('data', function(chunk) {
				body += chunk;
			});

			req.on('end', function() {
				var data = qs.parse(body);
				console.log(body);
				

				var template = fs.readFileSync( "./templates/template.html", 'utf8');
				if(data.login === "true"){
					
					if(Accounts.check_login(data.username, data.password)){
						var session_id = Sessions.create_session(data.username);
						
						//redirect to login page and close this reponse
						res.setHeader('Set-Cookie', ['session_id='+session_id]);
						res.writeHead(302, {'Location': './menu.html'});
						res.end();
						
						return;
/*						res.setHeader('Set-Cookie', ['session_id='+session_id]);
						res.writeHead(200, {'Content-Type': 'text/html'});
						template = template.replace("BODY_TEXT", success_message);
						template = template.replace(/TITLE_TEXT/g , "Create New Account");*/
					}
					else{
						res.writeHead(200, {'Content-Type': 'text/html'});
						template = template.replace("BODY_TEXT", failure_message+login_form);
						template = template.replace(/TITLE_TEXT/g , "Log Into System");
						res.write(template);
						res.end();
						
						return;
					}
				}
				
				res.writeHead(302, {'Location': './login.html'});
				res.end();
			});
		}
		else
		{
			var template = fs.readFileSync( "./templates/template.html", 'utf8');

			template = template.replace("BODY_TEXT", login_form);
			template = template.replace(/TITLE_TEXT/g , "Log Into System");
			
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(template);
			res.end();
		}
	}
}

module.exports = LoginWebResponse;