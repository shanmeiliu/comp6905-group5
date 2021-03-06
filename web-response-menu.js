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
const Sessions = require('./sessions.js');
const Elections = require('./elections.js');


//function modules
const parse_cookies = require('./parse_cookies.js');


//HTML Responses declared here 
var success_message = `
<p>User Login Succesfully <a href=\"./index.html\"> click here to do stuff</a></p>`;

var failure_message = `
	<p>Login Failed</p>`;

class MenuWebResponse extends WebResponse{
	
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
		else{
			//redirect to login page and close this response
			console.log("No Session ID Found")
			res.writeHead(302, {'Location': './login.html'});
			res.end();
			return false;
		}

		var username = await Sessions.get_session_user( cookies.session_id );
		var account = await Accounts.get_account(username);
		
		
		var template = fs.readFileSync( "./templates/template.html", 'utf8');
		
		var title_message = "";
		var html_message = "";
		var err_message = "";
		
		switch(account.type){
			case 'voter':
				title_message = "Voter Main Menu"					
				html_message += "<h2> Vote in Active Elections </h2>";
				html_message += "<form action=\"election_vote.html\" method=\"get\">";
				html_message += `<input type="hidden" name="election_vote" value="true">`;
				
				var tuple_list = await Elections.list_elections_all();
				for(var i = 0; i < tuple_list.length; i++){
					html_message += "<input type=\"radio\" name=\"election_id\" value=\""+ tuple_list[i].election_id + "\">" + tuple_list[i].election_name + "</input><br/>";
				}
				html_message += `<input type="submit" value"submit">`;
				html_message += "</form>";
				break;
				
			case 'election_commission':
				title_message = "Election Commission Main Menu";
				
				html_message += "<h2> View Results of Elections </h2>";
				html_message += "<form action=\"election_results.html\" method=\"get\">";
				html_message += `<input type="hidden" name="election_results" value="true">`;
				
				var tuple_list = await Elections.list_elections_all();
				for(var i = 0; i < tuple_list.length; i++){
					html_message += "<input type=\"radio\" name=\"election_id\" value=\""+ tuple_list[i].election_id + "\">" + tuple_list[i].election_name + "</input><br/>";
				}
				html_message += `<input type="submit" value"Modify">`;
				html_message += "</form>";
				
				html_message += "<h2> Create a New Elections </h2>";
				html_message += require('./web-form-election-create.js');				
				break;
				
			case 'party':
				title_message = "Party Main Menu";
				html_message += "<h2> Nominate Party in Active Elections </h2>";
				
				html_message += "<form action=\"nominate_party.html\" method=\"get\">";
				
				var tuple_list = await Elections.list_elections_party_nominatable();
				for(var i = 0; i < tuple_list.length; i++){
					html_message += "<input type=\"radio\" name=\"election_id\" value=\""+ tuple_list[i].election_id + "\">" + tuple_list[i].election_name + "</input><br/>";
				}
				html_message += `<input type="hidden" name="nominate_party" value="true">`;
				html_message += `<input type="submit" value"Submit">`;
				html_message += "</form>";
				break;
				
			case 'candidate':
				title_message = "Candidate Main Menu";
				html_message += "<h2>Register to Run in Active Election</h2>";
				
				html_message += "<form action=\"election_register_candidate.html\" method=\"get\">";
				html_message += `<input type="hidden" name="election_register_candidate" value="true">`;
				
				var tuple_list = await Elections.list_elections_candidate_nominatable();
				for(var i = 0; i < tuple_list.length; i++){
					html_message += "<input type=\"radio\" name=\"election_id\" value=\""+ tuple_list[i].election_id + "\">" + tuple_list[i].election_name + "</input><br/>";
				}
				html_message += `<input type="submit" value"submit">`;
				html_message += "</form>";				
				break;
			default:
				console.log("Session ID invalid")
				res.writeHead(302, {'Location': './login.html'});
				res.end();
				return
				break;
		}

		console.log(err_message);
		//html_message += `<p><a href="./logout.html">Logout from System</a></p>`;
		
		template = template.replace("BODY_TEXT", html_message);
		template = template.replace(/TITLE_TEXT/g , title_message);
		
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(template);
		res.end();
	}
}

module.exports = MenuWebResponse;