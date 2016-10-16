var express = require('express');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
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
  var dir = "logs/";
  var files = fs.readdirSync(dir);
  files.sort(function(a, b) {
    return fs.statSync(dir + b).mtime.getTime() -
      fs.statSync(dir + a).mtime.getTime();
  });
  var data = [];
  for (var file of files) {
    if (file == 'server.log' || file == 'tests.log' || !file.includes("build"))
      continue;
    var prefix = file.split("_build.log")[0];
    var date = (new Date(prefix)).toString().split("GMT")[0];
    var buildlink = file;
    var testlink = prefix + "_test.log";
    var fuzzlink = prefix + "_fuzzingTest.log";
    var staticlink = prefix + "_staticAnalysis.log";
    var temp = fs.readFileSync("logs/" + buildlink, "utf8");
    var branch = temp.indexOf("dev branch") != -1 ? "dev" : "release";
    var buildstatus = temp.indexOf("build successful") != -1 ? "successful" : "failure";
    var temp = fs.readFileSync("logs/" + testlink, "utf8");
    var teststatus = temp.indexOf("tests successful") != -1 ? "successful" : "failure";
    var temp = fs.readFileSync("logs/" + fuzzlink, "utf8");
    var fuzzstatus = temp.indexOf("fuzzing tests successful") != -1 ? "successful" : "failure";
    var temp = fs.readFileSync("logs/" + staticlink, "utf8");
    var staticstatus = temp.indexOf("static analysis successful") != -1 ? "successful" : "failure";
    data.push({
      date: date,
      branch: branch,
      buildstatus: buildstatus,
      teststatus: teststatus,
      fuzzstatus: fuzzstatus,
      staticstatus: staticstatus,
      buildlink: buildlink,
      testlink: testlink,
      fuzzlink: fuzzlink,
      staticlink: staticlink
    });
  }
  res.render('index', {
    title: 'Build Server',
    data: data
  });
});

//run tests
function runTests(testLogPath, branch) {
  fs.appendFileSync(serverLogFilePath, 'Running test script.\n');
  fs.writeFileSync(testLogPath, "Running tests for branch " + branch + " .");
  try {
    child = execSync("./scripts/run_tests.sh");
    fs.appendFileSync(testLogPath, '\nOutput in stdout:\n ' + child + "\n");
    fs.appendFileSync(testLogPath, branch + ' branch tests successful.\n');
    return true;
  } catch (error) {
    fs.appendFileSync(testLogPath, '\nexec error: \n' + error + "\n");
    fs.appendFileSync(testLogPath, branch + ' branch tests error.\n');
    return false;
  }
}

//run fuzzing tests
function runFuzzingTests(testLogPath, branch) {
  fs.appendFileSync(serverLogFilePath, 'Running fuzzing test script.\n');
  fs.writeFileSync(testLogPath, "Running fuzzing tests for branch " + branch + " .");
  try {
    child = execSync("./scripts/run_fuzzing_tests.sh");
    fs.appendFileSync(testLogPath, '\nOutput in stdout:\n ' + child + "\n");
    fs.appendFileSync(testLogPath, branch + ' branch fuzzing tests successful.\n');
    return true;
  } catch (error) {
    fs.appendFileSync(testLogPath, '\nexec error: \n' + error + "\n");
    fs.appendFileSync(testLogPath, branch + ' branch fuzzing tests error.\n');
    return false;
  }
}

//run static analysis
function runStaticAnalysis(testLogPath, branch) {
  console.log("Running static analysis script");
  fs.writeFileSync(testLogPath, "Running static analysis for branch " + branch);
  try {
    child = execSync("./scripts/run_static.sh");
    fs.appendFileSync(testLogPath, '\nOutput in stdout:\n ' + child + "\n");
    fs.appendFileSync(testLogPath, branch + ' branch static analysis successful.\n');
    return true;
  } catch (error) {
    fs.appendFileSync(testLogPath, '\nexec error: \n' + error + "\n");
    fs.appendFileSync(testLogPath, branch + ' branch static analysis error.\n');
    return false;
  }
}

//called by GitHub WebHook
app.post('/postreceive', function(req, res) {
  var branch = req.body.ref;
  var logPrefix = "logs/" + getCurrentTimeInISO();
  var buildLogPath = logPrefix + "_build.log";
  var testLogPath = logPrefix + "_test.log";
  var fuzzingTestLogPath = logPrefix + "_fuzzingTest.log";
  var staticTestLogPath = logPrefix + "_staticAnalysis.log";

  fs.writeFileSync(buildLogPath, 'Build triggered from GitHub WebHook.\n');
  fs.appendFileSync(buildLogPath, 'Branch updated: ' + branch + "\n");
  fs.appendFileSync(serverLogFilePath, 'POST request for /postreceive.\n');

  if (branch === "refs/heads/dev") {
    fs.appendFileSync(buildLogPath, 'Will build dev branch.\n');
    try {
      child = execSync("./scripts/build_dev");
      fs.appendFileSync(buildLogPath, '\nOutput in stdout:\n ' + child + "\n");
      fs.appendFileSync(buildLogPath, 'dev branch build successful.\n');
      if (runTests(testLogPath, "dev") &&
        runFuzzingTests(fuzzingTestLogPath, "dev") &&
        runStaticAnalysis(staticTestLogPath, "dev")) {
        fs.appendFileSync(serverLogFilePath, 'dev branch build and tests successful.\n');
        sendEmail(buildLogPath, "dev", true);
        res.send('dev branch build and test successful.');
      }
    } catch (error) {
      fs.appendFileSync(serverLogFilePath, 'dev branch build or tests failed.\n');
      fs.appendFileSync(buildLogPath, '\nexec error: \n' + error + "\n");
      fs.appendfilesync(buildLogpath, 'dev branch build error.\n');
      sendEmail(buildLogPath, "dev", false);
      res.send('dev branch build and test failed (check logs).');
    }
  } else if (branch === "refs/heads/release") {
    fs.appendFileSync(buildLogPath, 'Will build release branch.\n');
    try {
      child = execSync("./scripts/build_release");
      fs.appendFileSync(buildLogPath, '\nOutput in stdout:\n ' + child + "\n");
      fs.appendFileSync(buildLogPath, 'release branch build successful.\n');
      if (runTests(testLogPath, "release") &&
        runFuzzingTests(fuzzingTestLogPath, "release") &&
        runStaticAnalysis(staticTestLogPath, "release")) {
        console.log("release build or tests succeeded");
        sendEmail(buildLogPath, "release", true);
        res.send('release branch build and test successful.');
      }
    } catch (error) {
      console.log("release build or tests failed");
      fs.appendFileSync(buildLogPath, '\nexec error: \n' + error + "\n");
      fs.appendfilesync(buildLogpath, 'release branch build error.\n');
      sendEmail(buildLogPath, "release", false);
      res.send('release branch build and test failed (check logs).');
    }
  } else {
    fs.appendFileSync(buildLogPath, "Not in acceptable branch, no build will occur.\n");
    res.send("Not in dev or release branch, no build will occur.");
  }
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
