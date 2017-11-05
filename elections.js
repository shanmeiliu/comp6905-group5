/*
 * Elections
 * 
 */

//built in modules
const fs = require("fs");
const keygen = require("random-key");

class Elections{
	constructor(){
		this.elections = [];
		if (fs.existsSync("./data_store/elections.json")) {
		    if( fs.statSync("./data_store/elections.json").size > 0 ){
				this.load_JSON();	
		    }			
		}
	}
	
	add_election(name, date_start, date_end, date_register){
		
		var election_id = keygen.generate(32);
		this.elections.push(new Election(election_id, name,date_start, date_end, date_register));
		
		this.save_JSON();
		
		return election_id;
	}
	
	get_election(election_id){
		for(var i = 0; i < this.elections.length; i++){
			if( this.elections[i].election_id == election_id){
				return this.elections[i]
			} 
		}
	}
	
	
	list_elections_all(){
		var list = [];
		for(var i = 0; i < this.elections.length; i++){
			list.push({ 'election_id' : this.elections[i].election_id, 'name' : this.elections[i].name });
		}
		return list;
	}
	
	list_elections_votable(){
		var date = (new Date()).getTime();
		var list = [];
		for(var i = 0; i < this.elections.length; i++){
			if((date > this.elections[i].date_start) && (date < this.elections[i].date_end)){
				list.push({ 'election_id' : this.elections[i].election_id, 'name' : this.elections[i].name });	
			}
		}
		return list;
	}
	list_elections_nominatable(){
		var date = (new Date()).getTime();
		var list = [];
		for(var i = 0; i < this.elections.length; i++){
			if(date < this.elections[i].date_register){
				list.push({ 'election_id' : this.elections[i].election_id, 'name' : this.elections[i].name });	
			}
		}
		return list;
	}
	
	//early form of persistence
	save_JSON(){
		fs.writeFile("./data_store/elections.json", JSON.stringify(this.elections), function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("Election JSON File Updated");
		});
	}
	
	load_JSON(){
		var a = JSON.parse(fs.readFileSync( "./data_store/elections.json", 'utf8'));
		for(var i = 0; i < a.length; i++){
			this.elections.push(a[i]);
		}
	}
}

class Election{
	
	constructor(election_id, name,date_start, date_end, date_register  ){
		//identifier
		this.election_id = election_id;
		this.name = name;
		
		//unix timestamps
		this.date_start = date_start;
		this.date_end = date_end;
		this.date_register = date_register;
		
		this.ridings = [];
		this.votes = [];
	}
	
	add_riding(name){
		var riding_id = keygen.generate(32);
		
		this.ridings.push(new Riding(riding_id, name));				
	}
	
	/*
	 * bulk_add_ridings
	 *     input assumed to be a newline separated string 
	 */
	bulk_add_ridings( list ){
		var names = list.split('\n');
		for(var i = 0; i < names.length; i++){
			this.add_riding(names[i]);
		}
	}
	
	get_ridings(){
		
	}
	
}
/*
class Vote{
	constructor(id, Voter){
		this.id = id;
		this.name = name;
		
		this.candidates= [];
	}
}*/

class Riding {
	constructor(riding_id, name){
		this.riding_id = riding_id;
		this.name = name;
		
		this.candidates= [];
	}

    list_candidates(){
    	
    }
    
    display_results(){
    	
    }
}

var bob = new Elections();

console.log(bob.list_elections_all());
//console.log(bob.list_elections_votable());
console.log(bob.list_elections_nominatable());

/*
var start_date = (new Date(2016, 11, 1)).getTime();
var end_date = (new Date(2016, 12, 1)).getTime();
var nomination_date = (new Date(2016, 11, 14)).getTime();

var ridings= `Avalon
Bonavista—Burin—Trinity
Coast of Bays—Central—Notre Dame
Labrador
Long Range Mountains
St. John's East
St. John's South—Mount Pearl`;

var election_id = bob.add_election("asddadas Canadian National Election", start_date, end_date, nomination_date);

bob.get_election(election_id).add_riding("Avalon");
bob.get_election(election_id).add_riding("Bonavista–Burin–Trinity");
bob.get_election(election_id).add_riding("Coast of Bays–Central–Notre Dame");
bob.get_election(election_id).add_riding("Labrador");
bob.get_election(election_id).add_riding("Long Range Mountains");
bob.get_election(election_id).add_riding("St. John's East");
bob.get_election(election_id).add_riding("St. John's South–Mount Pearl");

election_id = bob.add_election("asdsdasdasdasdsa Canadian National Election", start_date, end_date, nomination_date);
bob.get_election(election_id).bulk_add_ridings(ridings);

bob.save_JSON();*/


module.exports = Elections;



