/*
 * Accounts
 * 		extends Web Response
 * 
 */
//built in modules
const fs = require("fs");

//local modules
var MongoClient = require('mongodb').MongoClient;
var db_url = "mongodb://localhost:27017/election";


class Accounts{
	constructor(){
	}

	create_account(username, password, type, callback){
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;

			db.collection("Accounts").findOne( {"username" : username.toLowerCase()} , function(err, result) {
				if(result == null){
					switch(type){
					case 'voter':
						db.collection("Accounts").insert({"username" : username.toLowerCase(), "password" : password , "type" : "voter" });	
						break;
					case 'election_commission':
						db.collection("Accounts").insert({"username" : username.toLowerCase(), "password" : password , "type" : "election_commission" });
						break;
					case 'party':
						db.collection("Accounts").insert({"username" : username.toLowerCase(), "password" : password , "type" : "party" });
						break;
					case 'candidate':
						db.collection("Accounts").insert({"username" : username.toLowerCase(), "password" : password , "type" : "candidate" });
						break;
					}
					callback(true);
				} else {
					callback(false);
				}
				db.close();
			});
		});
	}

	check_login(username, password, callback){
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;

			db.collection("Accounts").findOne( { "username" : username, "password" : password } , function(err, result) {
				if(result == null){
					callback(false)
				} else {
					callback(true);
				}
				db.close();
			});

			db.close()
		});
	}

	get_account(username, callback){
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;

			db.collection("Accounts").findOne( { "username" : username } , function(err, result) {
				if(result == null){
					callback(false)
				} else {
					switch(result.type){
					case 'voter':
						callback(new Voter(result.username, result.password));	
						break;
					case 'election_commission':
						callback(new ElectionCommission(result.username, result.password));
						break;
					case 'party':
						callback(new Party(result.username, result.password));
						break;
					case 'candidate':
						callback(new Candidate(result.username, result.password));
						break;
					}
				}
				db.close();
			});
			db.close()
		});
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
