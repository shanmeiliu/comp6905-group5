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
	
	/*
	 * Add Threshold to ParliamentaryElection
	 */
	async add_threshold( threshold ){
		var db = await MongoClient.connect(db_url);
		await db.collection("Elections").updateOne( { 'election_id' : this.election_id } , { $set: { "threshold" : threshold } } );
		
		var database_object = await db.collection("Elections").findOne( { 'election_id' : this.election_id } );
		this.database_object = database_object;
		
		db.close();
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
	
	async add_candidate( district_id , candidate_name, candidate_party,candidate_priority){
		var candidate_id = await Candidates.add_candidate_to_district ( this.election_id, district_id , candidate_name, candidate_party,candidate_priority);
		return candidate_id;
	}
	
	async get_candidates( district_id ) {
		var candidates = await Candidates.get_candidates_by_district ( this.election_id, district_id );
		return candidates; 
	}
	
	async vote( district_id, candidate_id, username  ){
		await Votes.add_vote_to_district( this.election_id, district_id, candidate_id, username )
	}
	
	async tabulate_results(){
		var result = {};
		result.vote_total = await Votes.total_votes_parliamentary( this.election_id );
		
		var party = await Candidates.get_parties( this.election_id );
		var party_list = [];
		var data = await Votes.count_votes_all_district(this.election_id );
		
		//result.data = data;
		for( var j =0; j < party.length; j++){
			var object  = {}
			object.party_name = party[j];
			object.party_count = 0;
			object.party_percent = 0;
			party_list.push(object);
		}	

		for( var j = 0; j < party_list.length; j++){
			var candidates = [];
			for(var i = 0; i < data.length; i++){
				var candidate_list = data[i].candidate_list;
				for( var k = 0; k < candidate_list.length; k++){
					if(candidate_list[k].candidate_party == party_list[j].party_name){
						party_list[j].party_count += candidate_list[k].candidate_count;
						candidates.push(candidate_list[k]);
					}
				}
				
			}
			candidates.sort(compare_candidates_percent);
			//console.log(candidates);
			party_list[j].candidates = candidates;
			party_list[j].party_percent = Math.round( party_list[j].party_count / result.vote_total * 10000  ) / 100;
		}
		party_list.sort(compare_parties);
		result.party_list = party_list;
		result.seats = data.length;
		
		var thresholded_party_list = [];
		for( var j = 0; j < party_list.length; j++){
			if(party_list[j].party_percent > this.database_object.threshold){
				thresholded_party_list.push(party_list[j]);
			}
			party_list[j].party_seats = 0
		}
		var newtotal = 0;
		for( var j = 0; j < thresholded_party_list.length; j++){
			newtotal += thresholded_party_list[j].party_percent
		}
		var running_total = 0
		for( var j = 0; j < thresholded_party_list.length-1; j++){
			thresholded_party_list[j].seats = Math.round(thresholded_party_list[j].party_percent / newtotal * result.seats);
			running_total += thresholded_party_list[j].seats;
		}
		thresholded_party_list[thresholded_party_list.length-1].seats = result.seats - running_total;
		
		for( var j = 0; j < thresholded_party_list.length; j++){
			thresholded_party_list[j].party_seats = Math.ceil(thresholded_party_list[j].seats/2);
			thresholded_party_list[j].public_seats = thresholded_party_list[j].seats - thresholded_party_list[j].party_seats;
			thresholded_party_list[j].winners = [];
			for(var i = 0; i < thresholded_party_list[j].public_seats; i++){
				thresholded_party_list[j].winners.push(thresholded_party_list[j].candidates[i])
			}
			var remainders = [];
			for(var i = thresholded_party_list[j].public_seats; i < thresholded_party_list[j].candidates.length; i++){
				remainders.push(thresholded_party_list[j].candidates[i])
			}
			remainders.sort(compare_candidates_priority)
			
			for(var i = 0; i < thresholded_party_list[j].party_seats; i++){
				thresholded_party_list[j].winners.push(remainders[i])
			}
			//console.log(thresholded_party_list[j].winners);
		}
		
		
		
				
		result.thresholded_party_list = thresholded_party_list;
		
		
		
		//result.party_results = await Votes.count_votes_parliamentary( this.election_id )
		
		
		//console.log(result);
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

function compare_parties(a,b) {
	if (a.party_count > b.party_count)
		return -1;
	if (a.party_count < b.party_count)
		return 1;
	return 0;
}
function compare_candidates_percent(a,b) {
	if (a.candidate_percent > b.candidate_percent)
		return -1;
	if (a.candidate_percent < b.candidate_percent)
		return 1;
	return 0;
}
function compare_candidates_priority(a,b) {
	if (a.candidate_priority < b.candidate_priority)
		return -1;
	if (a.candidate_priority > b.candidate_priority)
		return 1;
	return 0;
}

module.exports = Election;