var git  = require('gift'), moment = require('moment'), _ = require('underscore');

var repo = git(__dirname);

repo.branch(function(err,head){

	var commit_time = moment(head.commit.committed_date);

	var data = {
		branch : head.name,
		last_commit : commit_time.calendar()
	};


	console.log(data);

	var fs = require('fs');	

	fs.writeFile(__dirname + "/version.html", _.template(fs.readFileSync(__dirname + "/template.html", "utf-8"), data), function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The version.html file was updated!");
	    }
	}); 

});
