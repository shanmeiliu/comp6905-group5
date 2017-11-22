//Database information
var MongoClient = require('mongodb').MongoClient;
var db_url = "mongodb://localhost:27017/election";

//Global Libraries
const keygen = require("random-key");

//Local Libraries
const Election = require('./election.js'); 
const Districts = require('./districts.js');
const Candidates = require('./candidates.js');




module.exports = ParlimentaryElection;

