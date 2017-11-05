/*
 * Accounts
 * 		extends Web Response
 * 
 */
//built in modules
const fs = require("fs");

//local modules


class Accounts{
	constructor(){
		this.userlist = [];
		if (fs.existsSync("./data_store/accounts.json")) {
			this.load_JSON();			
		}
	}
	
	create_account(username, password, type){
		
		for(var i = 0; i < this.userlist.length; i++){
			if (this.userlist[i].check_username(username)){
				console.log("User already exist: " + username);
				return false;
			}
		}
		
		var new_account = this.create_account_helper(username, password, type);

		this.userlist.push(new_account);
		
		this.save_JSON();
		
		return true;
	}
	
	create_account_helper(username, password, type){
		switch(type){
			case 'voter':
				return new Voter(username, password);
				break;
			case 'election_commission':
				return new ElectionCommission(username, password);
				break;
			case 'party':
				return new Party(username, password);
				break;
			case 'candidate':
				return new Candidate(username, password);
				break;
			default:
				console.log("Invalid usertype: " + type);
				return false;
		}
	}
	
	save_JSON(){
		fs.writeFile("./data_store/accounts.json", JSON.stringify(this.userlist), function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("The file was saved!");
		}); 
		return JSON.stringify(this.userlist);
	}
	
	load_JSON(){
		var a = JSON.parse(fs.readFileSync( "./data_store/accounts.json", 'utf8'));
		
		for(var i = 0; i < a.length; i++){
			var new_account = this.create_account_helper(a[i].username, a[i].password, a[i].type);
			this.userlist.push(new_account);
		}
	}
	
	check_login(username, password){
		for(var i = 0; i < this.userlist.length; i++){
			if (this.userlist[i].check_login(username,password)){
				return true;
			}
		}
		return false;
	}
	
	get_account(username){
		for(var i = 0; i < this.userlist.length; i++){
			if (this.userlist[i].check_username(username)){
				return this.userlist[i];
			}
		}
		console.log("Account not found")
		return null;
	}
}

class Account{
	constructor (username, password){
		this.username = username.toLowerCase();
		this.password = password;
	}
	
	check_login( username, password){
		if((username.toLowerCase() === this.username) && (password === this.password)){
			return true;
		}
		return false;
	}
	
	check_username(username){
		if(username.toLowerCase() === this.username){
			return true;
		}
		return false;
	}
}

class Voter extends Account{
	constructor (username, password){
		super(username, password);
		this.type = "voter";
	}
}

class ElectionCommission extends Account{
	constructor (username, password){
		super(username, password);
		this.type = "election_commission";
	}
}

class Party extends Account{
	constructor (username, password){
		super(username, password);
		this.type = "party";
	}
}

class Candidate extends Account{
	constructor (username, password){
		super(username, password);
		this.type = "candidate";
	}
}

module.exports = Accounts;
