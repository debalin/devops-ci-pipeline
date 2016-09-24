var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/dev', function (req, res) {
        console.log('in dev get');
        res.send('dev branch build path from post-commit');
});

app.get('/release', function (req, res) {
        console.log('in release get');
        res.send('release branch build path from post-commit');
});

app.listen(3000, function () {
  console.log('Buildserver listening on port 3000!');
});
