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

class VoterVoteWebResponse extends WebResponse{
	
	constructor(page, file) {
		super(page);
	}
	
	response(req, res){	
		var sessions = new Sessions();
		var elections = new Elections();
		
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

		var template = fs.readFileSync( "./templates/template.html", 'utf8');
		var html_message = "";
		var err_message = "";
		var title_message = "";
		if(query.election_vote == "true")
		{
			var election_id = query.election_id;
			if(election_id == null){
				title_message = "ERROR"
				err_message += "Invalid form GET data for election_vote";
				html_message += "<p>Invalid form GET data for election_vote</p>";
			}
			else{
				var ridings_list = elections.get_election(election_id).list_ridings();
				
				title_message = "Choose Your Riding";
				html_message += "<p> Please select the ridding you are voting for</P>";
				html_message += "<form action=\"election_vote.html\" method=\"get\">";
				for(var i = 0; i < ridings_list.length; i++){
					html_message += "<input type=\"radio\" name=\"riding_id\" value=\""+ ridings_list[i].riding_id + "\">" + ridings_list[i].name + "</input><br/>";
				}
			
				html_message += `<input type="hidden" name="election_id" value="` + election_id + `">`;
				html_message += `<input type="hidden" name="election_vote_riding" value="true">`;
				html_message += `<input type="submit" value"Submit">`;
				html_message += "</form>";
			}

		}
		else if (query.election_vote_riding == "true"){
			var election_id = query.election_id;	
			var riding_id = query.riding_id;
			var session_id = cookies.session_id;
			if( (election_id == null) || (riding_id == null) || (session_id == null) ){
				title_message = "ERROR"
				err_message += "Invalid form GET data for election_vote_riding";
				html_message += "<p>Invalid form GET data for election_vote_riding</P>";
			}
			else{
				var accounts = new Accounts();
				var account = accounts.get_account(sessions.get_session_user(session_id));

				var candidates = elections.get_election(election_id).get_riding(riding_id).candidates;

				title_message = "Choose who you want to vote For";
				html_message += "<form action=\"election_vote.html\" method=\"get\">";
				for(var i = 0; i < candidates.length; i++){
					html_message += "<input type=\"radio\" name=\"candidate_id\" value=\""+ candidates[i].candidate_id + "\">" + candidates[i].name + " - " + candidates[i].party + "</input><br/>";
				}
				html_message += `<input type="hidden" name="election_id" value="` + election_id + `">`;
				html_message += `<input type="hidden" name="riding_id" value="` + riding_id + `">`;
				html_message += `<input type="hidden" name="election_vote_riding_voted" value="true">`;
				html_message += `<input type="submit" value"Submit">`;
				html_message += "</form>";

			}
		}
		else if (query.election_vote_riding_voted == "true"){			
			var election_id = query.election_id;	
			var riding_id = query.riding_id;
			var candidate_id = query.candidate_id;
			var session_id = cookies.session_id;
			
			if( (election_id == null) || (riding_id == null) || (session_id == null) || (candidate_id == null) ){
				title_message = "ERROR"
				err_message += "Invalid form GET data for election_vote_riding_voted";
				html_message += "<p>Invalid form GET data for election_vote_riding_voted</P>";
			}
			else{
				var accounts = new Accounts();
				var account = accounts.get_account(sessions.get_session_user(cookies.session_id));
				
				elections.get_election(election_id).get_riding(riding_id).add_vote(account.username, candidate_id);
				elections.save_JSON();
				
				title_message = "Voting succeeded"
				html_message += `<p> Thank you for voting in the upcoming election</p>`;
			}
		}
		else
		{
			title_message = "ERROR"
			html_message += `<p>Nothing to do here</p>`;
			err_message += "No form data submitted";
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

module.exports = VoterVoteWebResponse;