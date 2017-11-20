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

var create_election_form= `
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


class MenuWebResponse extends WebResponse{
	
	constructor(page, file) {
		super(page);
	}
	
	async response(req, res){
		var accounts = new Accounts();
		var elections = new Elections();
		var sessions = new Sessions();
		
		//Redirect to login if not logged i
		var cookies = parse_cookies(req);		
		if( cookies.hasOwnProperty('session_id')){
			console.log('Session ID found in cookie');
			var check = await sessions.check_session(cookies.session_id);  
			//console.log(check);
			if(!check){
				//redirect to login page and close this response
				console.log("Session ID invalid")
				res.writeHead(302, {'Location': './login.html'});
				res.end();
				return false;
			}
		}

		var username = await sessions.get_session_user( cookies.session_id );
		var account = await accounts.get_account(username);
		
		
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
				
				var tuple_list = elections.list_elections_votable();
				for(var i = 0; i < tuple_list.length; i++){
					html_message += "<input type=\"radio\" name=\"election_id\" value=\""+ tuple_list[i].election_id + "\">" + tuple_list[i].name + "</input><br/>";
				}
				html_message += `<input type="submit" value"submit">`;
				html_message += "</form>";
				break;
				
			case 'election_commission':
				title_message = "Election Commission Main Menu";
				
				html_message += "<h2> View Results of Elections </h2>";
				html_message += "<form action=\"election_modify.html\" method=\"get\">";
				html_message += `<input type="hidden" name="modify_election" value="true">`;
				
				var tuple_list = elections.list_elections_all();
				for(var i = 0; i < tuple_list.length; i++){
					html_message += "<input type=\"radio\" name=\"election_id\" value=\""+ tuple_list[i].election_id + "\">" + tuple_list[i].name + "</input><br/>";
				}
				html_message += `<input type="submit" value"Modify">`;
				html_message += "</form>";
				
				html_message += "<h2> Create a New Elections </h2>";
				html_message += create_election_form;				
				break;
				
			case 'party':
				title_message = "Party Main Menu";
				html_message += "<h2> Nominate Party in Active Elections </h2>";
				
				html_message += "<form action=\"nominate_party.html\" method=\"get\">";
				
				var tuple_list = elections.list_elections_nominatable();
				for(var i = 0; i < tuple_list.length; i++){
					html_message += "<input type=\"radio\" name=\"election_id\" value=\""+ tuple_list[i].election_id + "\">" + tuple_list[i].name + "</input><br/>";
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
				
				var tuple_list = elections.list_elections_votable();
				for(var i = 0; i < tuple_list.length; i++){
					html_message += "<input type=\"radio\" name=\"election_id\" value=\""+ tuple_list[i].election_id + "\">" + tuple_list[i].name + "</input><br/>";
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
		html_message += `<p><a href="./logout.html">Logout from System</a></p>`;
		
		template = template.replace("BODY_TEXT", html_message);
		template = template.replace(/TITLE_TEXT/g , title_message);
		
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(template);
		res.end();
	}
}

module.exports = MenuWebResponse;