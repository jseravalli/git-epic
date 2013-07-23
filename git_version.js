console.log("Fetching data, please wait...");

var parseArgs = function(args){

	parsedArgs = {
		"dir" : __dirname,
		"filter" : [],
		"output" : './version.html',
		"template" : __dirname + '/template.html'
	};

	for(var i = 0; i < args.length; i+=2){

		switch(args[i]){
			case '-d':
				parsedArgs.dir = args[i+1];
			break;
			case '-f':
				parsedArgs.filter = args[i+1].split(',');
			break;
			case '-o':
				parsedArgs.output = args[i+1];
			break;
			case '-t':
				parsedArgs.template = args[i+1];
			break;

		}

	}
	console.log(parsedArgs);
	return parsedArgs;
};

var git  = require('gift'), 
	moment = require('moment'), 
	_ = require('underscore'), 
	args = parseArgs(process.argv.splice(2)), 
	repo = git(args.dir),
	data = {tags : []},
	tagTotal = 0,
	tagCount = 0,
	skip = 0;



var render = function(){
	var fs = require('fs');	

	fs.writeFile(args.output, _.template(fs.readFileSync(args.template, "utf-8"), data), function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The version.html file was updated!");
	    }
	}); 
};

repo.tags(function(err,tags){

	tagTotal = tags.length;

	_.each(tags, function(tag){

		var commit_time = moment(tag.commit.committed_date);

		repo.commits(tag.name, function(err, commits){
			
			var filteredCommits;

			if(args.filter.length > 0){
				filteredCommits = _.filter(commits, function(commit){ 
					var result = false;

					for(var i = 0; i < args.filter.length; i++){

						if(commit.message.lastIndexOf(args.filter[i]) !== -1 ){
							result = true;
							break;
						}
					}

					return result; 
				});
			}

			data.tags.push({
				name : tag.name,
				last_commit : commit_time.calendar(),
				commits : args.filter.length > 0 ? filteredCommits : commits
			});

			tagCount++;

			if(tagCount === tagTotal){
				render();
			} 
		});


	});

});


