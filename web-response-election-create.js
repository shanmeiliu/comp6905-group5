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
		
		//Response Strings
		var html_message = "";
		var err_message = "";
		var title_message = "";
		
		if(query.election_create == "true")
		{
			var name = query.name;
			var start_date =query.start_date;
			var end_date = query. end_date;
			var elections = new Elections();
			console.log(query);
			
			var nomination_date = query.nomination_date;
			
			if( (name == "") || (start_date == "") || (end_date == "")|| (nomination_date == "")){
				title_message = "ERROR";
				err_message += "Invalid form GET data for election_create";
				html_message += "<p>Invalid form GET data for election_create</p>";	
			}
			else{
				var election_id = elections.add_election( query.name,
						(new Date(query.start_date)).getTime(),
						(new Date(query.end_date)).getTime(),
						(new Date(query.nomination_date)).getTime()	);
				
				if(query.ridings.length > 0)
					elections.get_election(election_id).bulk_add_ridings(query.ridings);
				else
					elections.get_election(election_id).add_riding("Default Riding");
				elections.save_JSON();

				title_message = "New Election Created";
				html_message += "<p>New election Created with the following details <br>name: " + query.name;
				html_message += "<br>Start Date: " + query.start_date;
				html_message += "<br>End Date: " + query.end_date;
				html_message += "<br>Nomination Deadline: " + query.nomination_date;
				html_message += "<br> Ridings: <br> " + query.ridings.replace(/\n/g,"<br>");
			}
		}
		else
		{
			title_message = "Create New Election";
			html_message += `
				<form action="./election_create.html" method="GET">
					<input type="hidden" name="election_create" value="true">
					<label for="name">Election name:</label><input type="text" name="name"><br> 
					<label for="start_date">Polls open date:</label> <input type="date" name="start_date"><br> 
					<label for="end_date">Polls close date:</label> <input type="date"	name="end_date"><br> 
					<label for="nomination_date">Candiate Nomination close date:</label> <input type="date" name="nomination_date"><br>
					<label for="ridings">Ridings <i>(One per line)</i>:</label><br>
					<textarea name="ridings" cols="40" rows="10"></textarea><br>
					<input type="submit">
				</form>`;
		}

		console.log(err_message);
		html_message += `<p><a href="./menu.html">Return to main menu</a></p>`;

		var template = fs.readFileSync( "./templates/template.html", 'utf8');
		template = template.replace("BODY_TEXT", html_message);
		template = template.replace(/TITLE_TEXT/g , title_message);
		
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(template);
		res.end();
	}
}

module.exports = RegistrationWebResponse;