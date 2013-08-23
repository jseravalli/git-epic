//main.js

(function() {
   //Declaring variables  
   var gitepic = require('./gitepic');

   gitepic.generate(process.argv.splice(2));

}).call(this);