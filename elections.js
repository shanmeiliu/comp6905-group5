/*
 * Elections
 * 
 */
//Database information
var MongoClient = require('mongodb').MongoClient;
const config = require('./configuration.js');
var db_url = config.database.url;

//built in modules
const fs = require("fs");
const keygen = require("random-key");

//local modules
const Election = require('./election.js'); 
const Districts = require('./districts.js');
const Candidates = require('./candidates.js');

class Elections{	
	static async add_election( election_name, date_start, date_end, date_register, election_type){
		var election_id = keygen.generate(32);
		var election = { 
			'election_id' : election_id, 
			'election_name' : election_name, 
			'date_start' : date_start, 
			'date_end' : date_end, 
			'date_register' : date_register, 
			'election_type' : election_type
		}
		
		var db = await MongoClient.connect(db_url);
		var session = await db.collection("Elections").insertOne(election);
		db.close();

		return election_id;
	}
	
	static async get_election(election_id){
		var election = await Election.init( election_id );
		return election;
	}
		
	static async list_elections_all(){
		var db = await MongoClient.connect(db_url);
		var list = await db.collection("Elections").find().toArray();
		return list;
	}
	
	static async list_elections_votable(){
		var date = (new Date()).getTime();
		var db = await MongoClient.connect(db_url);
		var list = await db.collection("Elections").find( {'date_start' : {$lt: date} , 'date_end' : {$gt: date} } ).toArray();
		return list;
	}
	
	static async list_elections_party_nominatable(){
		var date = (new Date()).getTime();
		var db = await MongoClient.connect(db_url);
		var list = await db.collection("Elections").find( {'date_register' : {$gt: date} , 'election_type' : 'parliamentary'} ).toArray();
		return list;
	}
	
	static async list_elections_candidate_nominatable(){
		var date = (new Date()).getTime();
		var db = await MongoClient.connect(db_url);
		var list = await db.collection("Elections").find( {'date_register' : {$gt: date} , 'election_type' : 'presidential'} ).toArray();
		return list;
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



