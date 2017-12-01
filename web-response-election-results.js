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

class ElectionResultsWebResponse extends WebResponse{
	
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
		
		if(query.election_results == "true")
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
				
				if(election.election_type == 'presidential'){
					var result = await election.tabulate_results();
					title_message = `Result for election '${election.database_object.election_name}'`;
					
					if(result.winner != null){
						html_message += `<p>The election has concluded with ${result.winner.candidate_name} winning. </p>`; 
					}
					else{
						html_message += `<p>The election is still ongoing, results are subject to change. </p>`; 
					}
					if(result.polls >= 1){
						html_message +=` <p>Results from round one are:</p>`;
						html_message +=`
						<table>
							<tr>
								<th>Candidate Name</th>
								<th>Totals</th>
								<th>Percent</th>
							</tr>`;
						
						for( var i = 0; i < result.poll_1.length; i++){
							html_message +=`
							<tr>
								<td>${result.poll_1[i].candidate_name}</td>
								<td>${result.poll_1[i].candidate_count}</td>
								<td>${result.poll_1[i].candidate_percent}</td>
								
							</tr>`;
						}
						html_message +=`</table>`;
					}
					if(result.polls >= 2){
						html_message +=` <p>Results from round two are:</p>`;
						html_message +=`
						<table>
							<tr>
								<th>Candidate Name</th>
								<th>Totals</th>
								<th>Percent</th>
							</tr>`;
						
						for( var i = 0; i < result.poll_2.length; i++){
							html_message +=`
							<tr>
								<td>${result.poll_2[i].candidate_name}</td>
								<td>${result.poll_2[i].candidate_count}</td>
								<td>${result.poll_2[i].candidate_percent}</td>
								
							</tr>`;
						}
						html_message +=`</table>`;
					}					
				}
				else if (election.election_type == 'parliamentary'){
					var result = await election.tabulate_results();
					title_message = `Result for election '${election.database_object.election_name}'`;
					
					html_message +=`
					<table>
						<tr>
							<th>Party Name</th>
							<th>Totals</th>
							<th>Percent</th>
							<th>Seats Earned</th>
						</tr>`;
					
					for( var i = 0; i < result.party_list.length; i++){
						html_message +=`
						<tr>
							<td>${result.party_list[i].party_name}</td>
							<td>${result.party_list[i].party_count}</td>
							<td>${result.party_list[i].party_percent}</td>
							<td>${result.party_list[i].party_seats}</td>
							
						</tr>`;
					}
					html_message +=`</table>`;
					
					html_message += `<p> The parliments will be made up of; `;
					if(result.thresholded_party_list.length  > 1){
						for( var i = 0; i < result.thresholded_party_list.length - 1; i++){
							html_message += `${result.thresholded_party_list[i].seats} seats from ${result.thresholded_party_list[i].party_name}, `;
						}
						html_message += `and ${result.thresholded_party_list[result.thresholded_party_list.length - 1].seats} seats from ${result.thresholded_party_list[result.thresholded_party_list.length - 1].party_name}`;	
					}
					else{
						html_message += `${result.thresholded_party_list[0].seats} seats from ${result.thresholded_party_list[0].party_name}, `;
					}
					
					for( var i = 0; i < result.thresholded_party_list.length; i++){
						html_message += `<p>${result.party_list[i].party_name} has selected;<ul>`;
						for( var j = 0; j < result.thresholded_party_list[i].winners.length; j++){
							html_message += `<li>${result.thresholded_party_list[i].winners[j].candidate_name} </li>`;
							
							
						}	
						html_message += `</ul>`;
					}
				}
			}
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

module.exports = ElectionResultsWebResponse;