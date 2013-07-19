var git  = require('gift'), moment = require('moment'), _ = require('underscore'), args = process.argv.splice(2), dir = args[0] ? args[0] : __dirname;

console.log("git-epic");

var repo = git(dir);

repo.branch(function(err,head){

	var commit_time = moment(head.commit.committed_date);

	var data = {
		branch : head.name,
		last_commit : commit_time.calendar(),
		directory : dir
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