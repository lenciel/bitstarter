var express = require('express');
var fs = require('fs');
var input_file = "index.html";

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  fs.readFile(input_file, function (err, data) {
    if (err) throw err;
    response.send(data.toString('utf-8'));
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
