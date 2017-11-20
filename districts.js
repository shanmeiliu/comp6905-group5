//Database information
var MongoClient = require('mongodb').MongoClient;
var db_url = "mongodb://localhost:27017/election";

//Global Libraries
const keygen = require("random-key");

//Local Libraries

class Districts{
	static async add_district( election_id, district_name ){
		var district_id = keygen.generate(32);		
		var district = new District( district_id, election_id, district_name );

		var db = await MongoClient.connect(db_url);
		var session = await db.collection("Districts").insertOne(district);
		db.close();

		return district_id;
	}
	
	static async get_districts( election_id ){
		var db = await MongoClient.connect(db_url);
		var districts = await db.collection("Districts").find( {'election_id' : election_id} ).toArray();
		db.close();
		
		return districts;

	}
}

class District{
	constructor(district_id, election_id, district_name){
		this.district_id = district_id;
		this.election_id = election_id;
		this.district_name = district_name;
	}
	
}
module.exports = Districts;