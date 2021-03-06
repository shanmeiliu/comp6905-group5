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

class CandidateRegisterWebResponse extends WebResponse{
	
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
		var template = fs.readFileSync( "./templates/template.html", 'utf8');
		var html_message = "";
		var err_message = "";
		var title_message = "";
		
		if(query.election_register_candidate == "true")
		{
			var election_id = query.election_id;
			if(election_id == null){
				title_message = "ERROR";
				err_message += "Invalid form GET data for election_register_candidate";
				html_message += "<p>Invalid form GET data for election_register_candidate</p>";
			}
			else{
				var election = await Elections.get_election( election_id );
				
				title_message = "Confirm your Candidacy";
				html_message += "<form action=\"election_register_candidate.html\" method=\"get\">";
				html_message += `<label for="candidate_name">Please type your name as you want it to appear on our ballot </label><input type="text" name="candidate_name" value=>`;
				html_message += `<input type="hidden" name="election_id" value="` + election_id + `">`;
				html_message += `<input type="hidden" name="election_register_candidate_confirm" value="true">`;
				html_message += `<input type="submit" value"Submit">`;
				html_message += "</form>";
			}
		}
		else if (query.election_register_candidate_confirm == "true"){
			var election_id = query.election_id;	
			var session_id = cookies.session_id;
			if( (election_id == null) || (session_id == null) ){
				title_message = "ERROR"
				err_message += "Invalid form GET data for election_register_candidate_riding";
				html_message += "<p>Invalid form GET data for election_register_candidate_riding</P>";
			}
			else{
				var election = await Elections.get_election( election_id );
				var username = await Sessions.get_session_user( session_id );
				
				election = election.add_candidate( query.candidate_name, username);
				
				title_message = "Registered as a Canadidate";
				html_message += `<p> Thank you for Registering for the upcoming election</p></p>`;
			}
		}
		else
		{
			title_message += "Register to Run in Active Elections </h2>";
			
			html_message += "<form action=\"election_register_candidate.html\" method=\"get\">";
			html_message += `<input type="hidden" name="election_register_candidate" value="true">`;
			
			var election_list = elections.list_elections_nominatable();
			for(var i = 0; i < election_list.length; i++){
				html_message += "<input type=\"radio\" name=\"election_id\" value=\""+ election_list[i].election_id + "\">" + election_list[i].name + "</input><br/>";
			}
			html_message += `<input typw="submit" value"submit">`;
			html_message += "</form>";
		}
		
		console.log(err_message);
		html_message += `<p><a href="./menu.html">Return to main menu</a></p>`;
		
		template = template.replace("BODY_TEXT", html_message);
		template = template.replace(/TITLE_TEXT/g , title_message);
		
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(template);
		res.end();
	}
}

module.exports = CandidateRegisterWebResponse;