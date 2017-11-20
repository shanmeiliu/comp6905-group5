/*
 * Accounts
 * 		extends Web Response
 * 
 */

//Database information
var MongoClient = require('mongodb').MongoClient;
var db_url = "mongodb://localhost:27017/election";

//built in modules
const fs = require("fs");

//local modules


class Accounts{
	constructor(){
	}
	
	async create_account(username, password, type){

		var db = await MongoClient.connect(db_url);
		var result = await db.collection("Accounts").findOne( { "username" : username } );
		
		if (result != null){
			console.log("User already exist: " + username);
			
			db.close();
			return false;
		} else {
			var new_account = this.create_account_helper(username, password, type);
			await db.collection("Accounts").insertOne( new_account );
			this.userlist.push(new_account);
			
			db.close();
			return true;	
		}
		
		
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
	
	async check_login(username, password){
		var db = await MongoClient.connect(db_url);
		var result = await db.collection("Accounts").findOne( { "username" : username, "password" : password } );

		if(result == null){
			db.close();
			return false;
		} else {
			db.close();
			return true;
		}
	}
	
	async get_account(username){
		var db = await MongoClient.connect(db_url);
		var result = await db.collection("Accounts").findOne( { "username" : username } );

		if(result == null){
			db.close();
			return null;
		} else {
			db.close();
			return this.create_account_helper(result.username, result.password, result.type);
		}
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
