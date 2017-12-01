var MongoClient = require('mongodb').MongoClient;
const config = require('./configuration.js');
var db_url = config.database.url;

const Accounts = require('./accounts.js');
const Sessions = require('./sessions.js');


MongoClient.connect(db_url, function(err, db) {
	if (err) throw err;
	db.createCollection("Accounts", function(err, res) {
		if (err) throw err;
		console.log("Collection created!");
		db.close();

	});

	db.createCollection("Sessions", function(err, res) {
		if (err) throw err;
		console.log("Collection created!");
	    db.close();

	});
	
	db.createCollection("Elections", function(err, res) {
		if (err) throw err;
		console.log("Collection created!");    db.close();

	});
	
	db.createCollection("Votes", function(err, res) {
		if (err) throw err;
		console.log("Collection created!");    db.close();

	});
	
	db.createCollection("Districts", function(err, res) {
		if (err) throw err;
		console.log("Collection created!");    db.close();

	});
	
	db.collection("Accounts").createIndex( {username:1} , {unique:true, background:false, w:1} );
	db.collection("Elections").createIndex( {election_id:1} , {unique:true, background:false, w:1} );
	db.collection("Sessions").createIndex( {session_id:1} , {unique:true, background:false, w:1} );
	db.collection("Districts").createIndex( {district_id:1} , {unique:true, background:false, w:1} );
    db.close();

	
});

Accounts.create_account('voter1',"password","voter");
Accounts.create_account( 'admin1',"password","election_commission")
Accounts.create_account( 'party1', "password", "party");
Accounts.create_account( 'candidate1', "password", "candidate");

Sessions.create_session_backdoor("voter1");
Sessions.create_session_backdoor("party1");
Sessions.create_session_backdoor("admin1");
Sessions.create_session_backdoor("candidate1");