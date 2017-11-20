/*
 * Elections
 * 
 */
//data base
var MongoClient = require('mongodb').MongoClient;
var db_url = "mongodb://localhost:27017/election";

//built in modules
const fs = require("fs");
const keygen = require("random-key");

//local modules
const Districts = require("./districts.js");

class Elections{
	add_election(name, date_start, date_end, date_register, type, district_names, callback){
		var election_id = keygen.generate(32);

		var election = {
				'election_id':  election_id, 
				'election_name' : name,
				'date_start': date_start, 
				'date_end': date_end,
				'date_register':date_register,
				'election_type' :type
		};

		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			db.collection("Elections").insertOne(election);
			db.close()
		});

		var districts = new Districts();		
		var names = district_names.split('\n');

		for(var i = 0; i < names.length; i++){
			districts.add_district( election_id, names[i]);
		}

		return election_id;
	}

	get_election(election_id){
		for(var i = 0; i < this.elections.length; i++){
			if( this.elections[i].election_id == election_id){
				return this.elections[i]
			} 
		}
	}

	list_elections_all(callback){
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			db.collection("Elections").find().toArray(function (err, docs) {
		        callback(docs);
		    });
			db.close()
		});		
	}

	list_elections_votable(callback){
		var date = (new Date()).getTime();
		
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			db.collection("Elections").find({'date_start' : {$lt: date} , 'date_end' : {$gt: date} }).toArray(function (err, docs) {
		        callback(docs);
		    });
			db.close()
		});	
	}
	
	list_elections_party_nominatable(callback){
		var date = (new Date()).getTime();
		
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			db.collection("Elections").find({'date_register' : {$gt: date} , 'election_type' : 'parliamentary'}).toArray(function (err, docs) {
		        callback(docs);
		    });
			db.close()
		});	
	}
	
	list_elections_single_nominatable(callback){
		var date = (new Date()).getTime();
		
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			db.collection("Elections").find({'date_register' : {$gt: date} , 'election_type' : 'presidential'}).toArray(function (err, docs) {
		        callback(docs);
		    });
			db.close()
		});	
	}
}

class Election{

	constructor(election_id, name,date_start, date_end, date_register  ){
		//identifier
		this.election_id = election_id;
		this.name = name;

		//unix timestamps
		this.date_start = date_start;
		this.date_end = date_end;
		this.date_register = date_register;

		this.ridings = [];
		this.votes = [];
	}

	list_ridings(){
		var list= [];
		for(var i = 0; i < this.ridings.length; i++){
			list.push({ 'riding_id' : this.ridings[i].riding_id, 'name' : this.ridings[i].name });
		}
		return list;
	}

	get_riding(riding_id){
		for(var i = 0; i < this.ridings.length; i++){
			if( this.ridings[i].riding_id == riding_id){
				return this.ridings[i]
			} 
		}
	}

	/*
	 * add_riding
	 *     singular adding of riding, generates a key.
	 */
	add_riding(name){
		var riding_id = keygen.generate(32);

		this.ridings.push(new Riding(riding_id, name));				
	}

	/*
	 * bulk_add_ridings
	 *     input assumed to be a newline separated string 
	 */
	bulk_add_ridings( list ){
		var names = list.split('\n');
		for(var i = 0; i < names.length; i++){
			this.add_riding(names[i]);
		}
	}
}

class PredientialElection extends Election{

}

class ParliamentaryElection extends Election{

}

class Vote{
	constructor(vote_id, username, candidate_id){
		this.vote_id = vote_id;
		this.username = username;
		this.candidate_id = candidate_id;
	}
}



class Riding {
	constructor(riding_id, name){
		this.riding_id = riding_id;
		this.name = name;

		this.candidates= [];
		this.votes = [];
	}

	add_candidate(name, party){
		var candidate_id = keygen.generate(32);
		this.candidates.push(new Candidate(candidate_id, name, party));
	}

	add_vote (username, candidate_id){
		var vote_id = keygen.generate(32);
		this.votes.push(new Vote(vote_id, username, candidate_id));
	}
	has_voted (username){

	}

	list_candidates(){

	}

	display_results(){

	}
}




//var bob = new Elections();

//console.log(bob.get_election("TMqnTN8i04TRsQAeVfrcWtEoD1FTu13h"));

//console.log(bob.list_elections_all());
//console.log(bob.list_elections_votable());
//console.log(bob.list_elections_nominatable());

/*
var start_date = (new Date(2016, 11, 1)).getTime();
var end_date = (new Date(2016, 12, 1)).getTime();
var nomination_date = (new Date(2016, 11, 14)).getTime();

var ridings= `Avalon
Bonavista—Burin—Trinity
Coast of Bays—Central—Notre Dame
Labrador
Long Range Mountains
St. John's East
St. John's South—Mount Pearl`;

var election_id = bob.add_election("asddadas Canadian National Election", start_date, end_date, nomination_date);

bob.get_election(election_id).add_riding("Avalon");
bob.get_election(election_id).add_riding("Bonavista–Burin–Trinity");
bob.get_election(election_id).add_riding("Coast of Bays–Central–Notre Dame");
bob.get_election(election_id).add_riding("Labrador");
bob.get_election(election_id).add_riding("Long Range Mountains");
bob.get_election(election_id).add_riding("St. John's East");
bob.get_election(election_id).add_riding("St. John's South–Mount Pearl");

election_id = bob.add_election("asdsdasdasdasdsa Canadian National Election", start_date, end_date, nomination_date);
bob.get_election(election_id).bulk_add_ridings(ridings);

bob.save_JSON();*/


module.exports = Elections;



