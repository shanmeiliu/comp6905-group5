//Database information
var MongoClient = require('mongodb').MongoClient;
const config = require('./configuration.js');
var db_url = config.database.url;

//Global Libraries
const keygen = require("random-key");

//Local Libraries

class Candidates{

	static async add_candidate_to_district ( election_id, district_id, candidate_name, candidate_party, candidate_priority){
		var db = await MongoClient.connect(db_url);
		var query = { 'district_id': district_id, 'election_id':  election_id, 'candidate_party': candidate_party }
		var old_candidate = await db.collection("Candidates").find(query).toArray();
		

		var candidate_id = keygen.generate(32);	
		if(old_candidate.length > 0)
			candidate_id = old_candidate[0].candidate_id
					
		var candidate = {
			'district_id': district_id,
			'election_id':  election_id,
			'candidate_id':  candidate_id,
			'candidate_name': candidate_name,
			'candidate_party': candidate_party,
			'candidate_priority': candidate_priority
		};

		if(old_candidate.length > 0)
			await db.collection("Candidates").update(query, candidate);
		else
			await db.collection("Candidates").insertOne(candidate);

		db.close()
		
		return candidate_id;
	}
	
	static add_candidate_to_poll ( election_id, poll_index, candidate_name, candidate_username ){
		
		var candidate_id = keygen.generate(32);		
		var candidate = {
			'poll_index': poll_index,
			'election_id':  election_id,
			'candidate_id':  candidate_id,
			'candidate_name': candidate_name,
			'candidate_username': candidate_username
		};

		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			db.collection("Candidates").insertOne(candidate);
			db.close()
		});

		return candidate_id;
	} 
	
	static async get_candidates_by_district ( election_id, district_id ){
		var db = await MongoClient.connect(db_url);
		var candidates = await db.collection("Candidates").find( {'election_id' : election_id, 'district_id' : district_id } ).toArray();
		db.close();
		
		//console.log(candidates);
		return candidates;
	}	
	
	static async get_candidates_by_party ( election_id, candidate_party ){
		var db = await MongoClient.connect(db_url);
		var districts = await db.collection("Candidates").find( {'election_id' : election_id, 'candidate_party' : candidate_party} ).toArray();
		db.close();
		
		return districts;
	}
	
	static async get_candidates_by_poll ( election_id, poll_index ){
		var db = await MongoClient.connect(db_url);
		var districts = await db.collection("Candidates").find( { 'election_id' : election_id , 'poll_index' : { $gte :  poll_index } } ).toArray();
		db.close();
		
		return districts;
	}	
	static async set_candidate_poll ( candidate_id, poll_index ){
		var db = await MongoClient.connect(db_url);
		await db.collection("Candidates").updateOne( { 'candidate_id' : candidate_id } , { $set: { "poll_index" : poll_index } } );
		db.close();
	}
	
	static async set_candidate_priority ( candidate_id, priority ){
		var db = await MongoClient.connect(db_url);
		await db.collection("Candidates").updateOne( { 'candidate_id' : candidate_id } , { $set: { "priority" : priority } } );
		db.close();
	}	
	
	
	static async get_parties( election_id ){
		var db = await MongoClient.connect(db_url);
		var parties =  await db.collection("Candidates").distinct( "candidate_party" , { 'election_id' : election_id } );
		//console.log(parties);
		db.close();
		return parties;
	}	
}

class Candidate{
	constructor(candidate_id, name, party){
		this.candidate_id = candidate_id;
		this.name = name;
		this.party = party;
	}
}

module.exports = Candidates;