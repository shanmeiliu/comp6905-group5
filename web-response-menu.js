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
	
	response(req, res){
		var sessions = new Sessions();
		var accounts = new Accounts();
		var elections = new Elections();
		
		var account;
		
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
		account = accounts.get_account(sessions.get_session_user(cookies.session_id));
		var template = fs.readFileSync( "./templates/template.html", 'utf8');
		
		switch(account.type){
			case 'voter':
				var html_list = "";
				html_list += "<h2> Vote in Active Elections </h2>";
				
				html_list += "<form action=\"election_vote.html\" method=\"get\">";
				html_list += `<input type="hidden" name="election_vote" value="true">`;
				
				var tuple_list = elections.list_elections_votable();
				for(var i = 0; i < tuple_list.length; i++){
					html_list += "<input type=\"radio\" name=\"elections\" value=\""+ tuple_list[i].session_id + "\">" + tuple_list[i].name + "</input><br/>";
				}
				html_list += `<input type="submit" value"submit">`;
				html_list += "</form>";
				
				template = template.replace("BODY_TEXT", "Voter");
				template = template.replace(/TITLE_TEXT/g , "Voter Main Menu");
				
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write(template);
				res.end();
				
				break;
				
			case 'election_commission':
				
				var html_list = "";
				html_list += "<h2> View Results of Elections </h2>";
				
				html_list += "<form action=\"election_modify.html\" method=\"get\">";
				html_list += `<input type="hidden" name="modify_election" value="true">`;
				
				var tuple_list = elections.list_elections_all();
				for(var i = 0; i < tuple_list.length; i++){
					html_list += "<input type=\"radio\" name=\"elections\" value=\""+ tuple_list[i].session_id + "\">" + tuple_list[i].name + "</input><br/>";
				}
				html_list += `<input type="submit" value"Modify">`;
				html_list += "</form>";
				
				html_list += "<h2> Create a New Elections </h2>";
				html_list += create_election_form;
				
				template = template.replace("BODY_TEXT", html_list);
				template = template.replace(/TITLE_TEXT/g , "Election Commission Main Menu");
				
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write(template);
				res.end();
				
				break;
				
			case 'party':
				var html_list = "";
				html_list += "<h2> Nominate Party in Active Elections </h2>";
				
				html_list += "<form action=\"nominate_party.html\" method=\"get\">";
				
				var tuple_list = elections.list_elections_nominatable();
				for(var i = 0; i < tuple_list.length; i++){
					html_list += "<input type=\"radio\" name=\"election_id\" value=\""+ tuple_list[i].election_id + "\">" + tuple_list[i].name + "</input><br/>";
				}
				html_list += `<input type="hidden" name="nominate_party" value="true">`;
				html_list += `<input type="submit" value"Submit">`;
				html_list += "</form>";
				
				template = template.replace("BODY_TEXT", html_list);
				template = template.replace(/TITLE_TEXT/g , "Party Main Menu");
				
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write(template);
				res.end();
				break;
				
			case 'candidate':
				template = template.replace("BODY_TEXT", "candidate");
				template = template.replace(/TITLE_TEXT/g , "Candidate Main Menu");
				
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write(template);
				res.end();
				
				break;
			default:
				console.log("Session ID invalid")
				res.writeHead(302, {'Location': './login.html'});
				res.end();
				break;
		}
	}
}

module.exports = MenuWebResponse;