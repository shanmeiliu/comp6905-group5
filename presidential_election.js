//Database information
var MongoClient = require('mongodb').MongoClient;
const config = require('./configuration.js');
var db_url = config.database.url;

//Global Libraries
const keygen = require("random-key");

//Local Libraries
const Election = require('./election.js'); 
const Districts = require('./districts.js');

module.exports = PresidentialElection;
