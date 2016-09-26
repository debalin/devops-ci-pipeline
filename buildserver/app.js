var express = require('express');
var exec = require('child_process').exec;
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();
var child;
var serverLogFilePath = "logs/server.log";

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

//processing for root request. put log list here
app.get('/', function(req, res) {
	fs.appendFileSync(serverLogFilePath, 'GET request for /. Will serve build history.\n');
  res.send('DevOps Milestone 1: This is where you will get to see all the build logs.');
});

//called by GitHub WebHook
app.post('/postreceive', function(req, res) {
  var branch = req.body.ref;
  var logFilePath = "logs/" + getCurrentTimeInISO() + ".log";

  fs.writeFileSync(logFilePath, 'Build triggered from GitHub WebHook.\n');
  fs.appendFileSync(logFilePath, 'Branch updated: ' + branch + "\n");
  fs.appendFileSync(serverLogFilePath, 'POST request for /postreceive.\n');

  if (branch === "refs/heads/dev") {
    fs.appendFileSync(logFilePath, 'Will build dev branch.\n');
    child = exec("./scripts/build-dev", function(error, stdout, stderr) {
      fs.appendFileSync(logFilePath, 'Output in stdout: ' + stdout + "\n");
      fs.appendFileSync(logFilePath, 'Output in stderr: ' + stderr + "\n");
      if (error !== null) {
        fs.appendFileSync(logFilePath, 'exec error: ' + error + "\n");
        res.send('dev branch build error (check logs).');
      } else {
        fs.appendFileSync(logFilePath, 'dev branch build successful.\n');
        res.send('dev branch build successful.');
      }
    });
  } else if (branch === "refs/heads/release") {
    child = exec("./scripts/build-release", function(error, stdout, stderr) {
      fs.appendFileSync(logFilePath, 'Output in stdout: ' + stdout + "\n");
      fs.appendFileSync(logFilePath, 'Output in stderr: ' + stderr + "\n");
      if (error !== null) {
        fs.appendFileSync(logFilePath, 'exec error: ' + error + "\n");
        res.send('release branch build error (check logs).');
      } else {
        fs.appendFileSync(logFilePath, 'release branch build successful.\n');
        res.send('release branch build successful.');
      }
    });
  } else {
    fs.appendFileSync(logFilePath, "Not in acceptable branch, no build will occur.\n");
    res.send("Not in dev or release branch, no build will occur.");
  }
});

//called by post-commit hook for dev branch
app.get('/dev', function(req, res) {
  var logFilePath = "logs/" + getCurrentTimeInISO() + ".log";

  fs.writeFileSync(logFilePath, 'Build triggered from post-commit for dev.\n');
  fs.appendFileSync(serverLogFilePath, 'GET request for /dev.\n');

  child = exec("./scripts/build-dev", function(error, stdout, stderr) {
    fs.appendFileSync(logFilePath, 'Output in stdout: ' + stdout + "\n");
    fs.appendFileSync(logFilePath, 'Output in stderr: ' + stderr + "\n");
    if (error !== null) {
      fs.appendFileSync(logFilePath, 'exec error: ' + error + "\n");
      res.send('dev branch build error (check logs).');
    } else {
      fs.appendFileSync(logFilePath, 'dev branch build successful.\n');
      res.send('dev branch build successful.');
    }
  });
});

//called by post-commit hook for release branch
app.get('/release', function(req, res) {
  var logFilePath = "logs/" + getCurrentTimeInISO() + ".log";

  fs.writeFileSync(logFilePath, 'Build triggered from post-commit for release.\n');
  fs.appendFileSync(serverLogFilePath, 'GET request for /release.\n');

  child = exec("./scripts/build-release", function(error, stdout, stderr) {
    fs.appendFileSync(logFilePath, 'Output in stdout: ' + stdout + "\n");
    fs.appendFileSync(logFilePath, 'Output in stderr: ' + stderr + "\n");
    if (error !== null) {
      fs.appendFileSync(logFilePath, 'exec error: ' + error + "\n");
      res.send('release branch build error (check logs).');
    } else {
      fs.appendFileSync(logFilePath, 'release branch build successful.\n');
      res.send('release branch build successful.');
    }
  });
  res.send('release branch build path from post-commit');
});

//server will listen on port 3000
app.listen(3000, function() {
  fs.appendFileSync(serverLogFilePath, 'Buildserver started at ' + getCurrentTimeInISO() + '. Listening on port 3000.\n');
});

//helper function to get current time in ISO format
function getCurrentTimeInISO() {
  return (new Date()).toISOString();
}
