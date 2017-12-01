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
	
	static async count_votes_for_candidate (election_id, poll_index, candidate_id){
		var db = await MongoClient.connect(db_url);
		//console.log(election_id);
		//console.log(poll_index);
		//console.log(candidate_id);
		var votes = await db.collection("Votes").find( { 'election_id' : election_id , 'poll_index' : String(poll_index) , 'candidate_id' : candidate_id } ).toArray();
		//console.log(await votes);
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
}

function compare_candidates(a,b) {
	if (a.candidate_count > b.candidate_count)
		return -1;
	if (a.candidate_count < b.candidate_count)
		return 1;
	return 0;
}

module.exports = Votes;




