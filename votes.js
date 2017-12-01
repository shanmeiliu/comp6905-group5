/*
 * Sessions
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
const Candidates = require('./candidates.js');
const Accounts = require('./accounts.js');
const Sessions = require('./sessions.js');
const Elections = require('./elections.js');
const Districts = require('./districts.js');


class Votes{
	static async add_vote_to_poll (election_id, poll_index, candidate_id, username ){
		var vote = {};
		vote.election_id = election_id; 
		vote.poll_index =  poll_index;
		vote.candidate_id = candidate_id;
		vote.voter_username = username;
		
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			db.collection("Votes").insertOne(vote);
			db.close();
		});
	}
	static async add_vote_to_district (election_id, district_id, candidate_id, username ){
		var vote = {};
		vote.election_id = election_id; 
		vote.district_id =  district_id;
		vote.candidate_id = candidate_id;
		vote.voter_username = username;
		
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			db.collection("Votes").insertOne(vote);
			db.close();
		});
	}
	
	static async count_votes_for_candidate (election_id, poll_index, candidate_id){
		var db = await MongoClient.connect(db_url);
		//console.log(election_id);
		//console.log(poll_index);
		//console.log(candidate_id);
		var votes = await db.collection("Votes").find( { 'election_id' : election_id , 'poll_index' : String(poll_index) , 'candidate_id' : candidate_id } ).toArray();
		//console.log(await votes);
		return votes.length;
	}
	
	static async count_votes_for_candidate_district (election_id, district_id, candidate_id){
		var db = await MongoClient.connect(db_url);
		//console.log(election_id);
		//console.log(poll_index);
		//console.log(candidate_id);
		var votes = await db.collection("Votes").find( { 'election_id' : election_id , 'district_id' : district_id , 'candidate_id' : candidate_id } ).toArray();
		//console.log(await votes);
		return votes.length;
	}
	
	static async count_votes_for_party (election_id, candidate_party ){
		var db = await MongoClient.connect(db_url);
		//console.log(election_id);
		//console.log(poll_index);
		//console.log(candidate_id);
		var votes = await db.collection("Votes").find( { 'election_id' : election_id , 'candidate_party' : candidate_party} ).toArray();
		console.log(votes);
		return votes.length;
	}
	
	static async count_votes_presidential(election_id, poll_index){
		var candidate_list = await Candidates.get_candidates_by_poll(election_id, poll_index);
		var total_votes = await Votes.total_votes_presidential(election_id, poll_index);
		//console.log(candidate_list);
		var results = [];
		
		for(var i = 0; i < candidate_list.length; i++){
			var object = {};
			object.candidate_name = candidate_list[i].candidate_name;
			object.candidate_id = candidate_list[i].candidate_id;
			object.candidate_count =  await Votes.count_votes_for_candidate(election_id, poll_index, candidate_list[i].candidate_id)
			object.candidate_percent = Math.round(object.candidate_count / total_votes * 10000) /100;
			results.push(object);
		}
		results.sort(compare_candidates);
		
		//console.log(results);
		return results;
	}
	
	static async total_votes_presidential(election_id, poll_index){
		var db = await MongoClient.connect(db_url);
		//console.log(election_id);
		//console.log(poll_index);
		//console.log(candidate_id);
		var votes = await db.collection("Votes").find( { 'election_id' : election_id , 'poll_index' : String(poll_index) } ).toArray();
		//console.log(await votes);
		return votes.length;
	}
	
	static async total_votes_parliamentary( election_id ){
		var db = await MongoClient.connect(db_url);
		//console.log(election_id);
		var votes = await db.collection("Votes").find( { 'election_id' : election_id } ).toArray();
		//console.log(await votes);
		return votes.length;
	}

	static async count_votes_parliamentary(election_id ){
		var results = [];
		var party_list = await Candidates.get_parties( election_id );
		var total_votes = await Votes.total_votes_parliamentary( election_id );
		
		for(var i = 0; i < party_list.length; i++){
			var object = {};
			object.party_name = party_list[i];
			object.party_count = await Votes.count_votes_for_party( election_id, party_list[i] );
			object.party_percent = Math.round( object.party_count / total_votes * 10000) /100;
			
			results.push(object);
		}
		
		results.sort(compare_parties);
		return results;
	}
	
	static async total_votes_district (election_id, district_id){
		var db = await MongoClient.connect(db_url);
		//console.log(election_id);
		//console.log(district_id);
		var votes = await db.collection("Votes").find( { 'election_id' : election_id , 'district_id' : district_id } ).toArray();
		//console.log(await votes);
		return votes.length;
	}
	
	static async count_votes_all_district( election_id ){
		var results = [];
		var district_list = await Districts.get_districts( election_id );
		
		for(var i = 0; i < district_list.length; i++){
			var object = await Votes.count_votes_district( election_id, district_list[i].district_id );			
			results.push(object);
		}		


		//console.log(results);		
		return results;
	}
	
	static async count_votes_district( election_id, district_id ){
		var results = {};
		results.district_id = district_id;
		var district = await Districts.get_district( election_id , district_id );
		results.district_name = district.district_name;		
		results.candidate_list = await Candidates.get_candidates_by_district( election_id , district_id );
		results.total_votes = await Votes.total_votes_parliamentary( election_id );
		
		for(var i = 0; i < results.candidate_list.length; i++){
			results.candidate_list[i].candidate_count = await Votes.count_votes_for_candidate_district( election_id, district_id, results.candidate_list[i].candidate_id );
			results.candidate_list[i].candidate_percent = Math.round( results.candidate_list[i].candidate_count / results.total_votes * 10000) /100;
		}		
		results.candidate_list.sort(compare_candidates);
		
		//console.log(results);
		return results;
	}
}

function compare_candidates(a,b) {
	if (a.candidate_count > b.candidate_count)
		return -1;
	if (a.candidate_count < b.candidate_count)
		return 1;
	return 0;
}

function compare_parties(a,b) {
	if (a.party_count > b.party_count)
		return -1;
	if (a.party_count < b.party_count)
		return 1;
	return 0;
}

module.exports = Votes;




