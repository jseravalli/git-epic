var git  = require('gift'), repo = git(__dirname), moment = require('moment');

repo.branch(function(err,head){

console.log("BRANCH: " + head.name);


var commit_time = moment(head.commit.committed_date);
console.log("LAST COMMIT: " + commit_time.calendar());


var fs = require('fs');
fs.writeFile(__dirname + "/version.html", "<html><head><title>Version</title></head><body><h1>Branch: " + head.name + "</h1><h2>Last Commit: "+commit_time.calendar()+"</h2></body></html>", function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The version.html file was updated!");
    }
}); 



});
