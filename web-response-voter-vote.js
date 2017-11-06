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

		if(query.election_vote == "true")
		{
			var election_id = query.election_id;
			var ridings_list = elections.get_election(election_id).list_ridings();
			
			var template = fs.readFileSync( "./templates/template.html", 'utf8');
			var html = "<p> Please select the ridding you are voting for</P>";
			
			html += "";

			html += "<form action=\"election_vote.html\" method=\"get\">";
			for(var i = 0; i < ridings_list.length; i++){
				html += "<input type=\"radio\" name=\"riding_id\" value=\""+ ridings_list[i].riding_id + "\">" + ridings_list[i].name + "</input><br/>";
			}
			
			html += `<input type="hidden" name="election_id" value="` + election_id + `">`;
			html += `<input type="hidden" name="election_vote_riding" value="true">`;
			html += `<input type="submit" value"Submit">`;
			html += "</form>";
						
			template = template.replace("BODY_TEXT", html);
			template = template.replace(/TITLE_TEXT/g , "Choose Your Riding");
			
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(template);
			res.end();
		}
		else if (query.election_vote_riding == "true"){
			var template = fs.readFileSync( "./templates/template.html", 'utf8');
			var html = ``;
			
			var election_id = query.election_id;	
			var riding_id = query.riding_id;

			var accounts = new Accounts();
			var account = accounts.get_account(sessions.get_session_user(cookies.session_id));
			
			var candidates = elections.get_election(election_id).get_riding(riding_id).candidates;
			
			
			html += "<form action=\"election_vote.html\" method=\"get\">";
			for(var i = 0; i < candidates.length; i++){
				html += "<input type=\"radio\" name=\"candidate_id\" value=\""+ candidates[i].candidate_id + "\">" + candidates[i].name + " - " + candidates[i].party + "</input><br/>";
			}

			html += `<input type="hidden" name="election_id" value="` + election_id + `">`;
			html += `<input type="hidden" name="riding_id" value="` + riding_id + `">`;
			html += `<input type="hidden" name="election_vote_riding_voted" value="true">`;
			html += `<input type="submit" value"Submit">`;
			html += "</form>";
			
			template = template.replace("BODY_TEXT", html);
			template = template.replace(/TITLE_TEXT/g , "Vote For Canadidate");
			
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(template);
			res.end();
		}
		else if (query.election_vote_riding_voted == "true"){
			var template = fs.readFileSync( "./templates/template.html", 'utf8');
			var html = ``;
			
			var election_id = query.election_id;	
			var riding_id = query.riding_id;
			var candidate_id = query.candidate_id;
			
			var accounts = new Accounts();
			var account = accounts.get_account(sessions.get_session_user(cookies.session_id));
			
			elections.get_election(election_id).get_riding(riding_id).add_vote(account.username, candidate_id);
			elections.save_JSON();
						
			html = `<p> Thank you for voting in the upcoming election</p><P> <a href="./menu.html">Return to main menu</a></p>`;
			
			template = template.replace("BODY_TEXT", html);
			template = template.replace(/TITLE_TEXT/g , "Vote For Canadidate");
			
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(template);
			res.end();
		}
		else
		{
			res.writeHead(302, {'Location': './menu.html'});
			res.end();
		}
	}
}

module.exports = VoterVoteWebResponse;