var MongoClient = require('mongodb').MongoClient;
var db_url = "mongodb://localhost:27017/election";

class testclass{
	constructor(elections){
		this.pointless = "pop";
		
		this.elections = elections;
		//this.load_data(this.load_data_callback);
	}
	
	static async init(){
		var db = await MongoClient.connect(db_url);
		//console.log(db);
		
		
		var elections = await db.collection("Accounts").find().toArray();
		//console.log(elections);
		return new testclass(elections);
	}
}

function test(){
	var bob = testclass.init();

	return bob.elections;
}

console.log(test());
/*
MongoClient.connect(db_url, function(err, db) {
	if (err) throw err;
	db.createCollection("Accounts", function(err, res) {
		if (err) throw err;
		console.log("Collection created!");
	});

	db.createCollection("Sessions", function(err, res) {
		if (err) throw err;
		console.log("Collection created!");
	});
	
	db.createCollection("Elections", function(err, res) {
		if (err) throw err;
		console.log("Collection created!");
	});
	
	db.createCollection("Votes", function(err, res) {
		if (err) throw err;
		console.log("Collection created!");
	});
	
	db.createCollection("Districts", function(err, res) {
		if (err) throw err;
		console.log("Collection created!");
	});
	
	db.collection("Accounts").createIndex( {username:1} , {unique:true, background:false, w:1} );

	db.collection("Elections").createIndex( {election_id:1} , {unique:true, background:false, w:1} );


	db.collection("Accounts").insertOne({username:'voter1', password:"password", type:"voter" });
	db.collection("Accounts").insertOne({username:'admin1', password:"password", type:"election_commission" })
	db.collection("Accounts").insertOne({username:'party1', password:"password", type:"party" });
	db.collection("Accounts").insertOne({username:'candidate1', password:"password", type:"candidate" });

	
});*/