//Database information
var MongoClient = require('mongodb').MongoClient;
const config = require('./configuration.js');
var db_url = config.database.url;

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
	
	static add_districts( election_id, district_list){
		var district_names = district_list.split('\n');
		for(var i = 0; i < district_names.length; i++){
			if( district_names[i] != '' ){
				Districts.add_district( election_id, district_names[i] );	
			}
		}
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