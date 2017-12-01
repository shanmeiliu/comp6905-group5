//Database information
var MongoClient = require('mongodb').MongoClient;
const config = require('./configuration.js');
var db_url = config.database.url;

//Global Libraries
const keygen = require("random-key");

//Local Libraries 
//const ParlimentaryElection = require('./parliamentary_election.js');
//const PresidentialElection = require('./presidential_election.js');

const Districts = require('./districts.js');
const Candidates = require('./candidates.js');
const Votes = require('./votes.js');

class Election {
	constructor( election_id, database_object ){
		this.election_id = election_id;
		this.database_object = database_object;
	}
	
	static async init( election_id ){
		var db = await MongoClient.connect(db_url);
		var database_object = await db.collection("Elections").findOne( { 'election_id' : election_id } );
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
	
	async tabulate_results(){
		var result = {};
		
		
		
		console.log(result);
		return result;
	}
}

class PresidentialElection extends Election {

	constructor( election_id ,database_object ){
		
		super( election_id , database_object );
		
		this.election_type = 'presidential';
	}
	
	async set_round_end ( round_end ){
		var db = await MongoClient.connect(db_url);
		await db.collection("Elections").updateOne( { 'election_id' : this.election_id } , { $set: { "round_end" : round_end } } );
		
		var database_object = await db.collection("Elections").findOne( { 'election_id' : this.election_id } );
		this.database_object = database_object;
		
		db.close();
	}
	
	async set_round ( poll_index ){
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
		
	async get_candidates( round_number ) {
		//console.log( round_number );
		var candidates = await Candidates.get_candidates_by_poll ( this.election_id , round_number );
		//console.log(candidates);
		return candidates; 
	}
	
	async vote( poll_index, candidate_id, username  ){
		await Votes.add_vote_to_poll( this.election_id, poll_index, candidate_id, username )
	}
	
	async tabulate_results(){
		var result = {};
		console.log(`Tabulating results for Presisdential Election: ${this.election_id}`);
		result.polls = await this.get_round()
		result.poll_1 = await Votes.count_votes_presidential(this.election_id, 1);
		result.poll_1_total = await Votes.total_votes_presidential(this.election_id, 1);

		var today = (new Date()).getTime();

		if (result.polls == 1){
			if (this.database_object.round_end < today){
				if(result.poll_1.length == 1){
					console.log(`Round 1 victory for: ${result.poll_1[0].candidate_name}`)
					Candidates.set_candidate_poll(result.poll_1[0].candidate_id,2);	
				}
			
				if(result.poll_1.length > 1){
					if(result.poll_1[0].candidate_count / result.poll_1_total > 0.5){
						console.log(`Round 1 victory for: ${result.poll_1[0].candidate_name}`)
						Candidates.set_candidate_poll(result.poll_1[0].candidate_id,2);	
					} else {
						console.log(`Round 2 promotion for: ${result.poll_1[0].candidate_name} and ${result.poll_1[1].candidate_name}`)	
						Candidates.set_candidate_poll(result.poll_1[0].candidate_id,2);	
						Candidates.set_candidate_poll(result.poll_1[1].candidate_id,2);
					}							
				}
				
				this.set_round(2);
			}
		} else {
			result.poll_2 = await Votes.count_votes_presidential(this.election_id, 2);
			result.poll_2_total =  await Votes.total_votes_presidential(this.election_id, 2);
			
			if(today > this.database_object.date_end){
				result.winner = {}
				result.winner.candidate_name = result.poll_2[0].candidate_name;
				result.winner.candidate_id = result.poll_2[0].candidate_id;
			}
		}		
				
		//console.log(result);
		return result;
	}
}

module.exports = Election;