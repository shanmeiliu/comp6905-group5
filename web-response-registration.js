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


//HTML Responses declared here 
var success_message = `
<p>User Created Succesfully <a href=\"./index.html\"> click here to proceed to login</a></p>`;

var failure_message = `
<p>User created creation failed <a href=\"./register.html\"> click here to return</a></p>`;

var registration_form = `
<p><form action=\"" + this.page + "\" method=\"POST\">
	<input type=\"hidden\" name=\"register\" value=\"true\">
	<label for=\"username\">Username:</label><input type=\"text\" name=\"username\"> <br />
	<label for=\"password\">Password:</label><input type=\"password\" name=\"password\"> <br />
	<label for=\"usertype\">Select User Type:</label><select name=\"usertype\">
		<option value=\"voter\">Voter</option>
		<option value=\"party\">Party</option>
		<option value=\"candidate\">Candidate</option>
		<option value=\"election_commission\">Admin</option>
	</select><br />
	<input type=\"submit\" value=\"Submit\">
</form></p>`;


class RegistrationWebResponse extends WebResponse{
	
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
				
				res.writeHead(200, {'Content-Type': 'text/html'});
				
				if(data.register === "true"){
					console.log("Registration attempted for user " + data.username);
					var accounts = new Accounts();
					
					//TODO verify input
					var template = fs.readFileSync( "./templates/template.html", 'utf8');
					if (accounts.create_account(data.username,data.password,data.usertype)){
						template = template.replace("BODY_TEXT", success_message);
						template = template.replace(/TITLE_TEXT/g , "Account Created Successfully");
					}
					else{
						template = template.replace("BODY_TEXT", failure_message);
						template = template.replace(/TITLE_TEXT/g , "Account Creation Failed");
					}
					res.write(template);
				}
				res.end();
			});
		}
		else
		{
			var template = fs.readFileSync( "./templates/template.html", 'utf8');

			template = template.replace("BODY_TEXT", registration_form);
			template = template.replace(/TITLE_TEXT/g , "Create New Account");
			
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(template);
			res.end();
		}
	}
}

module.exports = RegistrationWebResponse;