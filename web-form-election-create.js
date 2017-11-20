/**
 * 
 */
var html = `
	<form action="./election_create.html" method="GET">
	<input type="hidden" name="election_create" value="true">
	<label for="name">Election name:</label><input type="text" name="name"><br> 
	<label for="start_date">Polls open date:</label> <input type="date" name="start_date"><br> 
	<label for="end_date">Polls close date:</label> <input type="date"	name="end_date"><br> 
	<label for="nomination_date">Candiate Nomination close date:</label> <input type="date" name="nomination_date"><br>
	<label for="election_type">Election Type: </label>
	<select name="election_type">
	<option value="presidential">Presidential Election</option>
	<option value="parliamentary">Parliamentary Election</option>
	</select><br/>
	<label for="districts">Districts <i>(One per line)</i>:</label><br>
	<textarea name="districts" cols="40" rows="10"></textarea><br>
	<input type="submit">
	</form>`;

module.exports = html;