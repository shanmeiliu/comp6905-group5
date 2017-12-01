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
const Districts = require('./districts.js');

//function modules
const parse_cookies = require('./parse_cookies.js');

class VoterVoteWebResponse extends WebResponse{
	
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
		
		if(query.election_vote == "true")
		{
			var election_id = query.election_id;
			
			if(election_id == null){
				title_message = "ERROR"
				err_message += "Invalid form GET data for election_vote";
				html_message += "<p>Invalid form GET data for election_vote</p>";
			}
			else{
				var election = await Elections.get_election(election_id);
				
				switch( election.election_type ){
					case 'parliamentary':
						var district_list = await election.get_districts();

						title_message = "Choose Your District";
						html_message += "<p> Please select the ridding you are voting for</P>";
						html_message += "<form action=\"election_vote.html\" method=\"get\">";
		
						for(var i = 0; i < district_list.length; i++){
							html_message += "<input type=\"radio\" name=\"district_id\" value=\""+ district_list[i].district_id + "\">" + district_list[i].district_name + "</input><br/>";
						}
					
						html_message += `<input type="hidden" name="election_id" value="` + election_id + `">`;
						html_message += `<input type="hidden" name="election_vote_district" value="true">`;
						html_message += `<input type="submit" value"Submit">`;
						html_message += "</form>";
						break;
					case 'presidential':
						var poll_index = await election.get_round();
						var candidate_list = await election.get_candidates( poll_index );
						
						if( candidate_list.length  == 0 ){
							title_message = "No Candidates Found";
							html_message += `<p> Please check back later to see who is running </p>`;
						}
						else{
							title_message = "Choose who you want to vote For";
							html_message += "<form action=\"election_vote.html\" method=\"get\">";
							
							for(var i = 0; i < candidate_list.length; i++){
								html_message += "<input type=\"radio\" name=\"candidate_id\" value=\""+ candidate_list[i].candidate_id + "\">" + candidate_list[i].candidate_name + "</input><br/>";
							}
							html_message += `<input type="hidden" name="election_id" value="` + election_id + `">`;
							html_message += `<input type="hidden" name="poll_index" value="` + poll_index + `">`;
							html_message += `<input type="hidden" name="election_vote_presidential_voted" value="true">`;
							html_message += `<input type="submit" value"Submit">`;
							html_message += "</form>";
						}
						break;
					default:
						title_message = "This Type of election is not supported yet";
				}	
			}
		}
		else if (query.election_vote_district == "true"){
			var election_id =  query.election_id;			
			var district_id = query.district_id;
			var session_id = cookies.session_id;
			
			if( (election_id == null) || (district_id == null) || (session_id == null) ){
				title_message = "ERROR"
				err_message += "Invalid form GET data for election_vote_riding";
				html_message += "<p>Invalid form GET data for election_vote_riding</P>";
			}
			else{
				var account = Accounts.get_account(Sessions.get_session_user(session_id));
				var election =  await Elections.get_election(election_id);
				var candidate_list = await election.get_candidates(district_id);
				
				if ( candidate_list.length  == 0 ) {
					title_message = "No Candidates Found";
					html_message += `<p> Please check back later to see who is running </p>`;
				}
				else {
					title_message = "Choose who you want to vote For";
					html_message += "<form action=\"election_vote.html\" method=\"get\">";
					for(var i = 0; i < candidate_list.length; i++){
						html_message += "<input type=\"radio\" name=\"candidate_id\" value=\""+ candidate_list[i].candidate_id + "\">" + candidate_list[i].candidate_name + " - " + candidate_list[i].candidate_party + "</input><br/>";
					}
					html_message += `<input type="hidden" name="election_id" value="` + election_id + `">`;
					html_message += `<input type="hidden" name="district_id" value="` + district_id + `">`;
					html_message += `<input type="hidden" name="election_vote_district_voted" value="true">`;
					html_message += `<input type="submit" value"Submit">`;
					html_message += "</form>";
				}
			}
		}
		else if (query.election_vote_district_voted == "true"){			
			var election_id = query.election_id;	
			var district_id = query.district_id;
			var candidate_id = query.candidate_id;
			var session_id = cookies.session_id;
			
			if( (election_id == null) || (district_id == null) || (session_id == null) || (candidate_id == null) ){
				title_message = "ERROR"
				err_message += "Invalid form GET data for election_vote_riding_voted";
				html_message += "<p>Invalid form GET data for election_vote_riding_voted</P>";
			}
			else{
				var username = await Sessions.get_session_user(cookies.session_id);
				var election = await Elections.get_election(election_id);
				//console.log( district_id );
				//console.log( candidate_id );
				//console.log( username );
				await election.vote( district_id, candidate_id, username )
				
				title_message = "Voting succeeded"
				html_message += `<p> Thank you for voting in the upcoming election</p>`;
			}
		}
		else if (query.election_vote_presidential_voted == "true"){			
			var election_id = query.election_id;	
			var poll_index = query.poll_index;
			var candidate_id = query.candidate_id;
			var session_id = cookies.session_id;
			
			if( (election_id == null) || (poll_index == null) || (session_id == null) || (candidate_id == null) ){
				title_message = "ERROR"
				err_message += "Invalid form GET data for election_vote_riding_voted";
				html_message += "<p>Invalid form GET data for election_vote_riding_voted</P>";
			}
			else{
				var username = await Sessions.get_session_user(cookies.session_id);
				var election = await Elections.get_election(election_id);
				
				//console.log( poll_index );
				//console.log( candidate_id );
				//console.log( username );
				await election.vote( poll_index, candidate_id, username )
				
				title_message = "Voting succeeded"
				html_message += `<p> Thank you for voting in the upcoming election</p>`;
			}
		}
		else
		{
			title_message = "Select Active Ellection to Vote in:";
			html_message += "<form action=\"election_vote.html\" method=\"get\">";
			html_message += `<input type="hidden" name="election_vote" value="true">`;
			
			var election_list = Elections.list_elections_votable();
			for(var i = 0; i < election_list.length; i++){
				html_message += "<input type=\"radio\" name=\"election_id\" value=\""+ election_list[i].election_id + "\">" + election_list[i].name + "</input><br/>";
			}
			html_message += `<input type="submit" value"submit">`;
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

module.exports = VoterVoteWebResponse;