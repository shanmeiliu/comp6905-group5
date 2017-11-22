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
const Election = require('./election.js');
const Districts = require('./districts.js');

//function modules
const parse_cookies = require('./parse_cookies.js');

class PartyRegisterWebResponse extends WebResponse{
	
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
		
		if(query.nominate_party == "true")
		{
			var election_id = query.election_id;
			console.log(election);
			if(election_id == null){
				title_message = "ERROR";
				err_message += "Invalid form GET data for nominate_party";
				html_message += "<p>Invalid form GET data for nominate_party</p>";
			}
			else{
				var election = await Elections.get_election( election_id );
				var district_list = await election.get_districts();
				
				title_message = "Register your Candidates";
				html_message +=  "<p> Please enter the names of your candidates in the listed ridings please leave blank any places you have no one running";
				html_message += "<form action=\"nominate_party.html\" method=\"get\">";
				for(var i = 0; i < district_list.length; i++){
					html_message += "<label for= \"" + district_list[i].district_id + "\">"+ district_list[i].district_name + " :</label><input type=\"text=\" name=\"" + district_list[i].district_id + "\"> <br> \n";
				}
				html_message += `<input type="hidden" name="election_id" value="` + election_id + `">`;
				html_message += `<input type="hidden" name="nominate_party_list" value="true">`;
				html_message += `<input type="submit" value"Submit">`;
				html_message += "</form>";
			}
		}
		else if (query.nominate_party_list == "true"){			
			var election_id = query.election_id;
			var election = await Elections.get_election( election_id );
			
			var session_id = cookies.session_id;
			
			if( (election_id == null) || (session_id == null) ){
				title_message = "ERROR";
				err_message += "Invalid form GET data for nominate_party_list";
				html_message += "<p>Invalid form GET data for nominate_party_list</p>";
			}
			else{
				var district_list = await election.get_districts();
				var username = await Sessions.get_session_user(session_id);
				var account = await Accounts.get_account(username);
				
				for(var i = 0; i < district_list.length; i++){				
					if( query[district_list[i].district_id] ){
						election.add_candidate( district_list[i].district_id, query[district_list[i].district_id], account.username );
					}	
				}

				title_message = "Candidates Registered";
				html_message += `<p> Candidates Successfully Registered for upcoming election</p>`;
			}
		}
		else{
			title_message = "Register Party in Active Elections";
			html_message += "<form action=\"nominate_party.html\" method=\"get\">";
			var election_list = await Elections.list_elections_party_nominatable();
			
			for(var i = 0; i < election_list.length; i++){
				html_message += "<input type=\"radio\" name=\"election_id\" value=\""+ election_list[i].election_id + "\">" + election_list[i].name + "</input><br/>";
			}
			html_message += `<input type="hidden" name="nominate_party" value="true">`;
			html_message += `<input type="submit" value"Submit">`;
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

module.exports = PartyRegisterWebResponse;