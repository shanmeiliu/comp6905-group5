/*
 * Registration Web Response
 * 		extends Web Response
 * Returns the registration page and handles processing of the form results
 * 
 */
//built in modules
const qs = require('querystring');
const url = require('url');
const fs = require("fs");

//local modules
const WebResponse = require('./web-response.js');
const Accounts = require('./accounts.js');
const Sessions = require('./sessions.js');
const Elections = require('./elections.js');

//function modules
const parse_cookies = require('./parse_cookies.js');


//HTML Responses declared here 
var success_message = `
<p>User Created Succesfully <a href=\"./index.html\"> click here to proceed to login</a></p>`;

var failure_message = `
<p>User created creation failed <a href=\"./register.html\"> click here to return</a></p>`;

var create_election_form= `
	<form action="./election_create.html" method="GET">
		<input type="hidden" name="election_create" value="true"> 
		<label for="name">Election name:</label><input type="text" id="name"><br> 
		<label for="start_date">Polls open date:</label> <input type="date" id="start_date"><br> 
		<label for="end_date">Polls close date:</label> <input type="date"	id="end_date"><br> 
		<label for="nomination_date">Candiate Nomination close date:</label> <input type="date" id="nomination_end_date"><br>
		<label for="ridings">Ridings <i>(One per line)</i>:</label><br>
		<textarea name="ridings" cols="40" rows="10"></textarea><br>
		<input type="submit">
	</form>`;


class RegistrationWebResponse extends WebResponse{
	
	constructor(page, file) {
		super(page);
	}
	
	response(req, res){	
		var sessions = new Sessions();
		//Redirect to login if not logged in
		var cookies = parse_cookies(req);
		if( cookies.hasOwnProperty('session_id')){
			console.log('Session ID found in cookie');
			if(sessions.check_session(cookies.session_id)){
				console.log("Session ID valid")
			}else{
				//redirect to login page and close this response
				console.log("Session ID invalid")
				res.writeHead(302, {'Location': './login.html'});
				res.end();
				return false;
			}
		}
		
		//Parse GET variables
		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
		
		if(query.election_create == "true")
		{
			
			var elections = new Elections();
			var election_id = elections.add_election( query.name,
					(new Date(query.start_date)).getTime(),
					(new Date(query.end_date)).getTime(),
					(new Date(query.nomination_date)).getTime()	);
			if(query.ridings.length > 0){
				elections.get_election(election_id).bulk_add_ridings(query.ridings);
			}
			else{
				elections.get_election(election_id).add_riding("Default Riding");
			}
			elections.save_JSON();

			var template = fs.readFileSync( "./templates/template.html", 'utf8');
			var html = "";
			
			html += "<p>New election Created with the following details <br>name: " + query.name;
			html += "<br>Start Date: " + query.start_date;
			html += "<br>End Date: " + query.end_date;
			html += "<br>Nomination Deadline: " + query.nomination_date;
			html += "<br> Ridings: <br> " + query.ridings.replace(/\n/g,"<br>");
			html += "<br><a href=\"./menu.html\" > Return to Main Menu </a>";
						
			template = template.replace("BODY_TEXT", html);
			template = template.replace(/TITLE_TEXT/g , "New Election Created");
			
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(template);
			res.end();
		}
		else
		{
			var template = fs.readFileSync( "./templates/template.html", 'utf8');

			template = template.replace("BODY_TEXT", create_election_form);
			template = template.replace(/TITLE_TEXT/g , "Create New Election");
			
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(template);
			res.end();
		}
	}
}

module.exports = RegistrationWebResponse;