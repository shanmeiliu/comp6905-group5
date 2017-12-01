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
	
	async response(req, res){		
		if(req.method === "POST")
		{
			var body = '';
			req.on('data', function(chunk) {
				body += chunk;
			});

			req.on('end', async function() {
				var data = qs.parse(body);
				
				//Response Strings
				var template = fs.readFileSync( "./templates/template.html", 'utf8');
				var html_message = "";
				var err_message = "";
				var title_message = "";
				
						
				if(data.register === "true"){
					var username = data.username;
					var password = data.password;
					
					if( (username == "") || (password == "") ){
						title_message = "ERROR";
						err_message += "Invalid form GET data for register";
						html_message += "<p>Invalid form GET data for register</p>";						
					}
					else{						
						console.log("Registration attempted for user " + data.username);
						var is_account_created = await Accounts.create_account( data.username, data.password, data.usertype);
						if ( is_account_created ){
							title_message = "Account Created Successfully";
							html_message +=`<p>User Created Succesfully</p>`;
						}
						else{
							title_message = "ERROR";
							err_message += "User already exists";
							html_message += "<p>User already exists</p>";
						}						
					}					
					console.log(err_message);
					html_message += `<p><a href="./menu.html">Return to main menu</a></p>`;
					
					template = template.replace("BODY_TEXT", html_message);
					template = template.replace(/TITLE_TEXT/g , title_message);
					
					res.writeHead(200, {'Content-Type': 'text/html'});
					res.write(template);
					res.end();
					
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