/*
 * Sessions
 * 
 */

//built in modules
const fs = require("fs");
const keygen = require("random-key");

//local modules



class Sessions{
	constructor(){
		this.sessions = [];
		if (fs.existsSync("./data_store/sessions.json")) {
		    if( fs.statSync("./data_store/sessions.json").size > 0 ){
				this.load_JSON();	
		    }			
		}
	}
	
	create_session(username){
		var session_id = keygen.generate(32);
		var firstDay = new Date();
		var nextWeek = new Date(firstDay.getTime() + 7 * 24 * 60 * 60 * 1000);
		
		var session= {
				session_id:  session_id, 
				expires: nextWeek.getTime(), 
				username: username};

		
		this.sessions.push(session);
		
		this.save_JSON();
		return session_id;
	}
	
	check_session( session_id ){
		for(var i = 0; i < this.sessions.length; i++){
			var date = (new Date()).getTime();
			if( this.sessions[i].session_id == session_id){
				if(date < this.sessions[i].expires){
					return true
				}
				else{
					sessions.splice(i, 1);
					this.save_JSON();
					return false;
				}
			} 
		}
	}
	
	save_JSON(){
		fs.writeFile("./data_store/sessions.json", JSON.stringify(this.sessions), function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("Session ID JSON File Updated");
		});

		return JSON.stringify(this.sessions);
	}
	
	load_JSON(){
		var a = JSON.parse(fs.readFileSync( "./data_store/sessions.json", 'utf8'));
		
		for(var i = 0; i < a.length; i++){
			
			this.sessions.push(a[i]);
		}
	}
}

module.exports = Sessions;
