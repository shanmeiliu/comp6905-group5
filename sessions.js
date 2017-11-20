/*
 * Sessions
 * 
 */

var MongoClient = require('mongodb').MongoClient;
var db_url = "mongodb://localhost:27017/election";

//built in modules
const fs = require("fs");
const keygen = require("random-key");

//local modules
const Accounts = require('./accounts.js');


class Sessions{
	constructor(){
	}
	
	create_session(username){
		var session_id = keygen.generate(32);
		var firstDay = new Date();
		var nextWeek = new Date(firstDay.getTime() + 7 * 24 * 60 * 60 * 1000);
		
		var session= {
				session_id:  session_id, 
				expires: nextWeek.getTime(), 
				username: username};
		
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			db.collection("Sessions").insertOne(session);
			db.close();
		});
		return session_id;
	}
	
	/*
	 *  check_session
	 *  	Checks if session id is valid considering the context
	 *  	only removes expired session if session id is matching
	 */
	check_session( session_id , callback){
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;

			db.collection("Sessions").findOne( {"session_id" : session_id} , function(err, result) {
				if(result == null){
					callback(false)
					db.close();
					return;
				} else {
					var date = (new Date()).getTime();
					if(date < result.expires){
						callback(true);
					} else {
						db.collection("Sessions").remove({"session_id" : session_id});
						callback(false)
					}
					db.close();
				}
			});

			db.close()
		});
	}
	/*
	 *  get_session_user
	 *  	Assumes you have confirmed session before search
	 *  	does not check if session has expired
	 */
	get_session_user ( session_id ,callback ){
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			
			db.collection("Sessions").findOne( {"session_id" : session_id} , function(err, result) {
				if(result == null){
					callback(null)
				} else{
					var accounts = new Accounts();
					accounts.get_account(result.username, function(account){
						callback(account);
					});
				}
			});			
			db.close()
		});
	}
}

module.exports = Sessions;
