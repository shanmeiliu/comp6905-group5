/**
 * 
 */
var html = `
	<script>
		function election_form_change(){
			document.getElementById('presidential_form').style.display = 'none';
			document.getElementById('parliamentary_form').style.display = 'none';
			
			document.getElementById(document.getElementsByName('election_form')[0].value).style.display = 'block';
		}
	</script>
	<label for="election_form">Election Type: </label>
	<select name="election_form" onchange='election_form_change()'>    
		<option disabled selected value> -- select an option -- </option>
		<option value="presidential_form">  Presidential Election  </option>
		<option value="parliamentary_form"> Parliamentary Election </option>
	</select><br/>

	<div id='presidential_form' style="display:none">
		<form action="./election_create.html" method="GET">
			<input type="hidden" name="election_type" value="presidential">
			<input type="hidden" name="election_create" value="true">
			<label for="name">Election name:</label><input type="text" name="name"><br> 
			<label for="start_date">Polls open date:</label> <input type="date" name="start_date"><br> 
			<label for="poll_1_end_date">Round 1 end date:</label> <input type="date"	name="poll_1_end_date"><br> 
			<label for="poll_2_end_date">Round 2 end date:</label> <input type="date"	name="poll_2_end_date"><br> 
			<label for="nomination_date">Nomination end date:</label> <input type="date" name="nomination_date"><br>
			<input type="submit">
		</form>
	</div>
	
	<div id='parliamentary_form' style="display:none">
		<form action="./election_create.html" method="GET">
			<input type="hidden" name="election_type" value="parliamentary">
			<input type="hidden" name="election_create" value="true">
			<label for="name">Election name:</label><input type="text" name="name"><br> 
			<label for="start_date">Polls open date:</label> <input type="date" name="start_date"><br> 
			<label for="poll_2_end_date">Polls close date:</label> <input type="date"	name="poll_2_end_date"><br> 
			<label for="nomination_date">Nomination end date:</label> <input type="date" name="nomination_date"><br>
			<label for="districts">Districts <i>(One per line)</i>:</label><br>
			<textarea name="districts" cols="40" rows="10"></textarea><br>
			<input type="submit">
		</form>
	</div>
	`;

module.exports = html;