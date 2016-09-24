var express = require('express');
var app = express();
var exec = require('child_process').exec;
var child;

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/postreceive', function (req, res) {
  console.log('in postreceive post');
  var branch = req;
  console.log("Branch = " + branch);
  child = exec("./scripts/build-dev", function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
      console.error('exec error: ' + error);
      res.send('dev branch build ERROR (check logs)');
    } else {
      console.log('dev BUILD SUCCESSFUL (DO STUFF)');
      res.send('dev branch build SUCCESS (do stuff)');
    }
  });
});

app.get('/dev', function (req, res) {
  console.log('in dev get');
  child = exec("./scripts/build-dev", function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
      console.error('exec error: ' + error);
      res.send('dev branch build ERROR (check logs)');
    } else {
      console.log('dev BUILD SUCCESSFUL (DO STUFF)');
      res.send('dev branch build SUCCESS (do stuff)');
    }
  });
});

app.get('/release', function (req, res) {
  console.log('in release get');
  child = exec("./scripts/build-release", function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
      res.send('release branch build ERROR (check logs)');
    } else {
      console.log('release BUILD SUCCESSFUL (DO STUFF)');
      res.send('release branch build SUCCESS (do stuff)');
    }
  });
  res.send('release branch build path from post-commit');
});

app.listen(3000, function () {
  console.log('Buildserver listening on port 3000!');
});
