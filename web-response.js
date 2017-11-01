class WebResponse {
	constructor(page) {
		this.page = page;
	}

	check_hit(page){
		return(this.page == page)
	}
	response(req, res) {
	}
}

module.exports = WebResponse;