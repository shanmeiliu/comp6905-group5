var config = {};

config.database = {};
config.database.host = '127.0.0.1';
config.database.port = 23346;
config.database.name = 'election';
config.database.url = "mongodb://" + config.database.host + ":" + config.database.port + "/"+ config.database.name;

config.web = {};
config.web.hostname = 'excalibur.cs.mun.ca'; 
config.web.port = 3346;

module.exports = config;