//Dependencies

var git  = require('gift'), 
	moment = require('moment'), 
	_ = require('underscore');

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

var	args = parseArgs(process.argv.splice(2)), 
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
	        console.log("The version file was updated!");
	    }
	}); 
};

repo.tags(function(err,tags){

	tagTotal = tags.length-1;

	_.each(tags, function(tag){	

		console.log("Processing tag: " + tag.name);

		repo.commits(tag.name, function(err, commits){
			
			var commit_time = moment(tag.commit.committed_date),
				filteredCommits;

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
				last_commit : commit_time.format('YYYY-MM-DD'),
				commits : args.filter.length > 0 ? filteredCommits : commits
			});

			tagCount++;

			console.log("Processed tag: " + tag.name + ", total commits: " + commits.length);

			if(tagCount === tagTotal){

				for(var i = data.tags.length-1; i > 0; i--){

					if(typeof(data.tags[i].commits) !== 'undefined' && typeof(data.tags[i-1].commits) !== 'undefined'){

						data.tags[i].commits = data.tags[i].commits.slice(0,data.tags[i].commits.length - data.tags[i-1].commits.length);
					
					}
						
				}

				render();
			} 
		});


	});

});


