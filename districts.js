//Database information
var MongoClient = require('mongodb').MongoClient;
var db_url = "mongodb://localhost:27017/election";

//Global Libraries
const keygen = require("random-key");

//Local Libraries

class Districts{
	add_district( election_id, name ){
		var district_id = keygen.generate(32);		
		var district = {
			'district_id': district_id,
			'election_id':  election_id, 
			'district_name': name
		};

		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			db.collection("Districts").insertOne(district);
			db.close()
		});

		return district_id;
	}
	
	get_districts( election_id, callback ){
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			db.collection("Districts").find( {'election_id' : election_id} ).toArray(function (err, docs) {
		        callback(docs);
		    });
			db.close()
		});
	}
}

module.exports = Districts;