console.log("Fetching data, please wait...");

var git  = require('gift'), 
	moment = require('moment'), 
	_ = require('underscore'), 
	args = process.argv.splice(2), dir = args[0] ? args[0] : __dirname,
	repo = git(dir),
	data = {tags : []},
	tagTotal = 0,
	tagCount = 0,
	skip = 0;

var render = function(){
	var fs = require('fs');	

	fs.writeFile(dir + "/version.html", _.template(fs.readFileSync(__dirname + "/template.html", "utf-8"), data), function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The version.html file was updated!");
	    }
	}); 
}

repo.tags(function(err,tags){

	tagTotal = tags.length;

	_.each(tags, function(tag){

		var commit_time = moment(tag.commit.committed_date);

		repo.commits(tag.name, function(err, commits){
			data.tags.push({
				name : tag.name,
				last_commit : commit_time.calendar(),
				commits : commits
			});

			tagCount++;

			if(tagCount === tagTotal){
				render();
			} 
		});


	});

});


