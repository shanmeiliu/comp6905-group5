//Database information
var MongoClient = require('mongodb').MongoClient;
var db_url = "mongodb://localhost:27017/election";

//Global Libraries
const keygen = require("random-key");

//Local Libraries

class Candidates{
	add_candidate(name, party, election_id, district_id){
		var candidate_id = keygen.generate(32);		
		var candidate = {
			'district_id': district_id,
			'election_id':  election_id,
			'candidate_id':  candidate_id,
			'candidate_name': name,
			'party': party
		};

		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			db.collection("Candidates").insertOne(candidate);
			db.close()
		});

		return candidate_id;

	}
}

module.exports = Candidates;