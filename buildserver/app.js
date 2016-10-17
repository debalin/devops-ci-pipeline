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
  //http://stackoverflow.com/questions/10559685/using-node-js-how-do-you-get-a-list-of-files-in-chronological-order
  files.sort(function(a, b) {
    return fs.statSync(dir + b).mtime.getTime() -
      fs.statSync(dir + a).mtime.getTime();
  });
  var data = [];
  for (var file of files) {
    if (file == 'server.log' || file == 'tests.log' || file == 'email.log' || !file.includes("build"))
      continue;
    var prefix = file.split("_build.log")[0];
    var date = (new Date(prefix)).toString().split("GMT")[0];
    var buildLink = file;
    var testLink = prefix + "_test.log";
    var fuzzLink = prefix + "_fuzzingTest.log";
    var staticLink = prefix + "_staticAnalysis.log";
    var temp = fs.readFileSync("logs/" + buildLink, "utf8");
    var branch = temp.indexOf("dev branch") != -1 ? "dev" : "release";
    var buildstatus = temp.indexOf("build successful") != -1 ? "successful" : "failure";
    var temp = fs.readFileSync("logs/" + testLink, "utf8");
    var teststatus = temp.indexOf("tests successful") != -1 ? "successful" : "failure";
    var temp = fs.readFileSync("logs/" + fuzzLink, "utf8");
    var fuzzstatus = temp.indexOf("fuzzing tests successful") != -1 ? "successful" : "failure";
    var temp = fs.readFileSync("logs/" + staticLink, "utf8");
    var staticstatus = temp.indexOf("static analysis successful") != -1 ? "successful" : "failure";
    var testResultFile = fs.readFileSync("logs/" + testLink, "utf8");
    if (testResultFile.indexOf("All files             |") > -1)
      var coverage = testResultFile.substring(testResultFile.indexOf("All files             |") + 24, testResultFile.indexOf("|", testResultFile.indexOf("All files             |") + 24)).trim();
    else
      var coverage = "N/A";
    data.push({
      date: date,
      branch: branch,
      buildstatus: buildstatus,
      teststatus: teststatus,
      fuzzstatus: fuzzstatus,
      staticstatus: staticstatus,
      buildLink: buildLink,
      testLink: testLink,
      fuzzLink: fuzzLink,
      staticLink: staticLink,
      coverage: coverage
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
    child = execSync("./scripts/run_tests.sh", { encoding: "utf8" });
    fs.appendFileSync(testLogPath, '\nOutput in stdout:\n ' + child + "\n");
    var coverage = child.substring(child.indexOf("All files             |") + 24, child.indexOf("|", child.indexOf("All files             |") + 24)).trim();
    if (parseFloat(coverage) < 75) {
      fs.appendFileSync(testLogPath, branch + ' branch tests did not pass coverage criteria.\n');
      return false;
    } else {
      fs.appendFileSync(testLogPath, branch + ' branch tests successful.\n');
      return true;
    }
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
    var buildResult;
    fs.appendFileSync(buildLogPath, 'Will build dev branch.\n');
    try {
      child = execSync("./scripts/build_dev.sh");
      fs.appendFileSync(buildLogPath, '\nOutput in stdout:\n ' + child);
      fs.appendFileSync(buildLogPath, 'dev branch build successful.\n');
      buildResult = true;
    } catch (error) {
      fs.appendFileSync(serverLogFilePath, 'dev branch build failed.\n');
      fs.appendFileSync(buildLogPath, '\nexec error: \n' + error + "\n");
      fs.appendfilesync(buildLogpath, 'dev branch build error.\n');
      buildResult = false;
    }

    var testResults = true;
    testResults = runTests(testLogPath, "dev") && testResults;
    testResults = runFuzzingTests(fuzzingTestLogPath, "dev") && testResults;
    testResults = runStaticAnalysis(staticTestLogPath, "dev") && testResults;
    if (testResults) {
      fs.appendFileSync(serverLogFilePath, 'All dev branch tests successful.\n');
    } else {
      fs.appendFileSync(serverLogFilePath, 'Some dev branch test failed.\n');
    }

    sendEmail("dev", logPrefix, buildResult, testResults);

    res.send('dev branch build and test complete. Check logs for results.');
  } else if (branch === "refs/heads/release") {
    fs.appendFileSync(buildLogPath, 'Will build release branch.\n');
    try {
      child = execSync("./scripts/build_release.sh");
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
      sendEmail(buildildLogPath, "release", false);
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
function sendEmail(branch, logPrefix, buildResult, testResults) {
  var buildLink = logPrefix + "_build.log";
  var testLink = logPrefix + "_test.log";
  var fuzzLink = logPrefix + "_fuzzingTest.log";
  var staticLink = logPrefix + "_staticAnalysis.log";

  var emailContent = "";

  emailContent += "\n\nBuild log: \n[excerpt]\n";
  emailContent += fs.readFileSync(buildLink, "utf8").trim().split("\n").slice(-20).join("\n");
  emailContent += "\n\nTest log + Coverage report: \n[excerpt]\n";
  emailContent += fs.readFileSync(testLink, "utf8").trim().split("\n").slice(-15).join("\n");
  emailContent += "\n\nFuzzing log: \n[excerpt]\n";
  emailContent += fs.readFileSync(fuzzLink, "utf8").trim().split("\n").slice(-15).join("\n");
  emailContent += "\n\nStatic analysis log: \n[excerpt]\n";
  emailContent += fs.readFileSync(staticLink, "utf8").trim().split("\n").slice(-15).join("\n");
  emailContent += "\n\nGo to http://ec2-54-191-99-255.us-west-2.compute.amazonaws.com:3000/ to check detailed logs."

  var emailLogFile = "logs/email.log";
  fs.writeFileSync(emailLogFile, emailContent);

  var execQuery = "./scripts/send_email.sh " + emailLogFile + " " + branch + " " + buildResult + " " + testResults;
  var child = exec(execQuery, function(error, stdout, stderr) {
    if (error !== null) {
      fs.appendFileSync(serverLogFilePath, "\n" + stderr);
      fs.appendFileSync(serverLogFilePath, "\nProblem sending email to admins.\n");
    } else {
      fs.appendFileSync(serverLogFilePath, "\n" + stdout);
      fs.appendFileSync(serverLogFilePath, "\nEmail sent to admins.\n");
    }
  })
}
