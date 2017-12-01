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
	
	async response(req, res){	
		//Redirect to login if not logged i
		var cookies = parse_cookies(req);		
		if( cookies.hasOwnProperty('session_id')){
			console.log('Session ID found in cookie');
			
			var check = await Sessions.check_session(cookies.session_id);  
			if(!check){
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
			var end_date = query.poll_2_end_date;
			var nomination_date = query.nomination_date;

			console.log(name);
			console.log(start_date);
			console.log(end_date);
			console.log(nomination_date);
			
			if( (name == "") || (start_date == "") || (end_date == "")|| (nomination_date == "")){
				title_message = "ERROR";
				err_message += "Invalid form GET data for election_create";
				html_message += "<p>Invalid form GET data for election_create</p>";	
			}
			else{
				var election_id = await Elections.add_election( name,
						(new Date( start_date )).getTime(),
						(new Date( end_date )).getTime(),
						(new Date( nomination_date )).getTime(),
						query.election_type);
				
				if(query.election_type == 'parliamentary'){
					var election = await  Elections.get_election( election_id );
					election.add_districts( query.districts );
					election.add_threshold( query.threshold );
				}
				
				if(query.election_type == 'presidential'){
					var election = await  Elections.get_election( election_id );
					election.set_round_end((new Date( query.poll_1_end_date )).getTime());
				}
								
				if(query.election_type == 'parliamentary'){
					title_message = "New Election Created";
					html_message += "<p>New election Created with the following details <br>name: " + name;
					html_message += "<br>Start Date: " + start_date;
					html_message += "<br>End Date: " + end_date;
					html_message += "<br>Nomination Deadline: " + nomination_date;
					html_message += "<br> Districts: <br> " + query.districts.replace(/\n/g,"<br>");
				}
				
				if(query.election_type == 'presidential'){
					title_message = "New Election Created";
					html_message += "<p>New election Created with the following details <br>name: " + name;
					html_message += "<br>Start Date: " + start_date;
					html_message += "<br>Round 1 end Date: " + end_date;
					html_message += "<br>Round 2 end Date: " + query.poll_2_end_date;
					html_message += "<br>Nomination Deadline: " + nomination_date;
				}
			}
		}
		else
		{
			title_message = "Create New Election";
			html_message += require('./web-form-election-create.js');
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