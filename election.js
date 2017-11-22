//Database information
var MongoClient = require('mongodb').MongoClient;
var db_url = "mongodb://localhost:27017/election";

//Global Libraries
const keygen = require("random-key");

//Local Libraries 
//const ParlimentaryElection = require('./parliamentary_election.js');
//const PresidentialElection = require('./presidential_election.js');

const Districts = require('./districts.js');
const Candidates = require('./candidates.js');

class Election {
	constructor( election_id, database_object ){
		this.election_id = election_id;
		this.database_object = database_object;
	}
	
	static async init( election_id ){
		var db = await MongoClient.connect(db_url);
		var database_object = await db.collection("Elections").findOne( { 'election_id' : election_id } );
		console.log(database_object);
		db.close();
		var result;
		switch( database_object.election_type ) {
			case 'parliamentary':
				result =  new ParliamentaryElection( election_id, database_object );
				break;
			case 'presidential':	
				result = new PresidentialElection( election_id, database_object );
				break;
			default:
				result = null;
		}
		//console.log(result);
		return result;		
	}
}

class ParliamentaryElection extends Election {
	constructor ( election_id ,database_object ) {
		super( election_id , database_object );
		
		this.election_type = 'parliamentary';
	}
	
	async add_district( district_name ){
		var district_id = await Districts.add_district( this.election_id, district_name );
		return district_id;
	}
	
	async add_districts( district_names ){
		await Districts.add_districts( this.election_id, district_names );
		return;
	}
	
	async get_districts(){
		var districts = await Districts.get_districts( this.election_id );
		return districts;
	}
	
	async add_candidate( district_id , candidate_name, candidate_party){
		var candidate_id = await Candidates.add_candidate_to_district ( this.election_id, district_id , candidate_name, candidate_party );
		return candidate_id;
	}
	
	async get_candidates( district_id ) {
		var candidates = await Candidates.get_candidates_by_district ( this.election_id, district_id );
		return candidates; 
	}
}

class PresidentialElection extends Election {

	constructor( election_id ,database_object ){
		
		super( election_id , database_object );
		
		this.election_type = 'presidential';
	}
	
	async set_round( poll_index ){
		var db = await MongoClient.connect(db_url);
		await db.collection("Elections").updateOne( { 'election_id' : this.election_id } , { $set: { "poll_index" : poll_index } } );
		var database_object = await db.collection("Elections").findOne( { 'election_id' : this.election_id } );
		
		this.database_object = database_object;
		
		db.close();
	}
	async get_round(){
		if( this.database_object.poll_index == null ){
			this.set_round(1);	
			return 1;
		}
		return this.database_object.poll_index;
	}
	
	async add_candidate( candidate_name, candidate_username){
		var candidate_id = await Candidates.add_candidate_to_poll ( this.election_id, 1 , candidate_name, candidate_username );
		return candidate_id;
	}
		
	async get_candidates( ) {
		var current_round = await this.get_round();
		var candidates = await Candidates.get_candidates_by_poll ( this.election_id , current_round );
		console.log(candidates);
		return candidates; 
	}
}

module.exports = Election;