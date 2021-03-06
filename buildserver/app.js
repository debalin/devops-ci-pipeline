var express = require('express');
var exec = require('child_process').exec;
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');

var app = express();
var child;
var serverLogFilePath = "logs/server.log";

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'logs')));

//processing for root request. put log list here
app.get('/', function(req, res) {
  fs.appendFileSync(serverLogFilePath, 'GET request for /. Will serve build history.\n');
  var files = fs.readdirSync("logs/");
  var data = [];
  for (var file of files) {
    if (file == 'server.log')
      continue;
    var date = (new Date(file.split(".log")[0])).toString().split("GMT")[0];
    var link = file;
    var temp = fs.readFileSync("logs/" + file, "utf8");
    var branch = temp.indexOf("dev branch") != -1 ? "dev" : "release";
    var status = temp.indexOf("build successful") != -1 ? "successful" : "failure";
    data.push({
      date: date,
      link: link,
      branch: branch,
      status: status
    });
  }
  res.render('index', {
    title: 'Build Server',
    data: data
  });
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
    child = exec("./scripts/build_dev", function(error, stdout, stderr) {
      fs.appendFileSync(logFilePath, '\nOutput in stdout:\n ' + stdout + "\n");
      fs.appendFileSync(logFilePath, '\nOutput in stderr: \n' + stderr + "\n");
      if (error !== null) {
        fs.appendFileSync(logFilePath, '\nexec error: \n' + error + "\n");
        fs.appendFileSync(logFilePath, 'dev branch build error.\n');
        sendEmail(logFilePath, "dev", false);
        res.send('dev branch build error (check logs).');
      } else {
        fs.appendFileSync(logFilePath, 'dev branch build successful.\n');
        sendEmail(logFilePath, "dev", true);
        res.send('dev branch build successful.');
      }
    });
  } else if (branch === "refs/heads/release") {
    child = exec("./scripts/build_release", function(error, stdout, stderr) {
      fs.appendFileSync(logFilePath, '\nOutput in stdout: \n' + stdout + "\n");
      fs.appendFileSync(logFilePath, '\nOutput in stderr: \n' + stderr + "\n");
      if (error !== null) {
        fs.appendFileSync(logFilePath, '\nexec error: \n' + error + "\n");
        fs.appendFileSync(logFilePath, 'release branch build error.\n');
        sendEmail(logFilePath, "release", false);
        res.send('release branch build error (check logs).');
      } else {
        fs.appendFileSync(logFilePath, 'release branch build successful.\n');
        sendEmail(logFilePath, "release", true);
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

  child = exec("./scripts/build_dev", function(error, stdout, stderr) {
    fs.appendFileSync(logFilePath, '\nOutput in stdout: \n' + stdout + "\n");
    fs.appendFileSync(logFilePath, '\nOutput in stderr: \n' + stderr + "\n");
    if (error !== null) {
      fs.appendFileSync(logFilePath, '\nexec error: \n' + error + "\n");
      fs.appendFileSync(logFilePath, 'dev branch build error.\n');
      sendEmail(logFilePath, "dev", false);
      res.send('dev branch build error (check logs).');
    } else {
      fs.appendFileSync(logFilePath, 'dev branch build successful.\n');
      sendEmail(logFilePath, "dev", true);
      res.send('dev branch build successful.');
    }
  });
});

//called by post-commit hook for release branch
app.get('/release', function(req, res) {
  var logFilePath = "logs/" + getCurrentTimeInISO() + ".log";

  fs.writeFileSync(logFilePath, 'Build triggered from post-commit for release.\n');
  fs.appendFileSync(serverLogFilePath, 'GET request for /release.\n');

  child = exec("./scripts/build_release", function(error, stdout, stderr) {
    fs.appendFileSync(logFilePath, '\nOutput in stdout: \n' + stdout + "\n");
    fs.appendFileSync(logFilePath, '\nOutput in stderr: \n' + stderr + "\n");
    if (error !== null) {
      fs.appendFileSync(logFilePath, '\nexec error: \n' + error + "\n");
      fs.appendFileSync(logFilePath, 'release branch build error.\n');
      sendEmail(logFilePath, "release", false);
      res.send('release branch build error (check logs).');
    } else {
      fs.appendFileSync(logFilePath, 'release branch build successful.\n');
      sendEmail(logFilePath, "release", true);
      res.send('release branch build successful.');
    }
  });
});

//server will listen on port 3000
app.listen(3000, function() {
  fs.appendFileSync(serverLogFilePath, 'Buildserver started at ' + getCurrentTimeInISO() + '. Listening on port 3000.\n');
});

//helper function to get current time in ISO format
function getCurrentTimeInISO() {
  return (new Date()).toISOString();    
}

//helper function to send emails
function sendEmail(logFilePath, branch, buildSuccess) {
  var execQuery = "./scripts/send_email " + logFilePath + " " + branch + " " + buildSuccess;
  var child = exec(execQuery, function(error, stdout, stderr) {
    if (error !== null) {
      fs.appendFileSync(logFilePath, "\n" + stderr);
      fs.appendFileSync(logFilePath, "\nProblem sending email to admins.\n");
    } else {
      fs.appendFileSync(logFilePath, "\n" + stdout);
      fs.appendFileSync(logFilePath, "\nEmail sent to admins.\n");
    }
  })
}
