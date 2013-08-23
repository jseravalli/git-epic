

//Dlecaring dependencies
var git  = require('gift'),
	moment = require('moment'),
	_ = require('underscore');

//Declaring the epic object
//process.argv.splice(2)
//repo: git(args.dir)
var epic = {
		args : {},
		repo: null,
		data: {tags : []},
		tagTotal: 0,
		tagCount: 0,
		skip: 0
	};



epic.parseArgs = function(args){

	parsedArgs = {
		"dir" : ".",
		"filter" : [],
		"output" : './version.html',
		"template" : __dirname + '/template.html',
		"tags" : -1
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
			case '-n':
				parsedArgs.tags = args[i+1];
			break;

		}

	}
	this.args = parsedArgs;
};


epic.render = function(){
	var fs = require('fs');

	fs.writeFile(this.args.output, _.template(fs.readFileSync(this.args.template, "utf-8"), this.data), function(err) {
		if(err) {
			console.log("There was an error updating the version file: ", err);
		} else {
			console.log("The version file was updated!");
		}
	});
};


epic.fetch = function(cb){

	var render = this.render,
	repo = this.repo,
	args = this.args,
	data = this.data,
	tagTotal = this.tagTotal,
	tagCount = this.tagCount;

	console.log("Fetching data, please wait...");

	this.repo.tags(function(err,tags){

		tagTotal = tags.length;

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

					if(args.tags > 0){
						data.tags = data.tags.slice(tagTotal - args.tags);
					}

					cb();
				}
			});

		}); // end of for each tag
		

	});// end of repo tags

	this.data = data;

};


epic.generate = function(args){
	var self = this;

	processArgs = args || [];
	
	this.parseArgs(processArgs);
	this.repo = git(this.args.dir);
	this.fetch(function(){
		console.log("Rendering...");
		self.render();
	});
	
};

module.exports = epic;