var express = require('express');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var analysis = require('./analysis.js');
var extract = require('esprima-extract-comments');
var redis = require('redis'); 
var client = redis.createClient(7000, '0.0.0.0', {}); 
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

var srcDirectory = "/home/ubuntu/markdown-js/src/";
var monitorMetrics; 
	setInterval(function(){ 
		client.get("usageKey", function(err, monitorMetrics){
			if (monitorMetrics!=null){
			var arr = monitorMetrics.split(":");
			if(arr.length > 0){
				fs.appendFileSync(serverLogFilePath, "\nMETRICS Recieved!.\n");
				fs.appendFileSync(serverLogFilePath, monitorMetrics);
				var emailContent = "";   
				//arr[0] = arr[0].replace('\n', ''); 
				//arr[1] = arr[1].replace('\n', '');
				if (parseInt(arr[0]) > 1.0 && parseInt(arr[1]) > 1.0)
					emailContent = "Both the CPU and Memory usages are above threshold limits"; 
				else if(parseInt(arr[0])> 1.0 && parseInt(arr[1]) < 1.0)
					emailContent = "CPU usage is above threshold"; 
				else if(parseInt(arr[0])< 1.0 && parseInt(arr[1]) > 1.0)
					emailContent = "Memory usage is above threshold limit"; 
				if(emailContent!=""){
					fs.appendFileSync(serverLogFilePath, "\nSending email about the monitoring metrics to the admins.\n");
					var emailLogFile = "logs/email.log";
					fs.writeFileSync(emailLogFile, emailContent);
					var execQuery = "./scripts/send_email1.sh "+emailLogFile; 
					var child = exec(execQuery, function (error, stdout, stderr) {
    						if (error !== null) {
     						 fs.appendFileSync(serverLogFilePath, "\n" + stderr);
  	    						 fs.appendFileSync(serverLogFilePath, "\nProblem sending email to admins.\n");
    						} else {
      							 fs.appendFileSync(serverLogFilePath, "\n" + stdout);
      							 fs.appendFileSync(serverLogFilePath, "\nEmail sent to admins.\n");
   	 					}
 					 });
				}	
				else {
					fs.appendFileSync(serverLogFilePath, "\nMETRICS Haven't been Recieved!.\n"); 
				}
				client.set("usageKey", "");
			}
		}}); 
	}, 2000); 

//processing for root request. put log list here
app.get('/', function (req, res) {
  fs.appendFileSync(serverLogFilePath, 'GET request for /. Will serve build history.\n');
  var dir = "logs/";
  var files = fs.readdirSync(dir);
  //http://stackoverflow.com/questions/10559685/using-node-js-how-do-you-get-a-list-of-files-in-chronological-order
  files.sort(function (a, b) {
    return fs.statSync(dir + b).mtime.getTime() -
      fs.statSync(dir + a).mtime.getTime();
  });
  var data = [];
  for (var file of files) {
    if (file == 'server.log' || file == 'tests.log' || file == 'email.log' || !file.includes("customMetrics"))
      continue;
    var prefix = file.split("_customMetrics.log")[0];
    var date = (new Date(prefix)).toString().split("GMT")[0];
    var buildLink = prefix + "_build.log";
    var testLink = prefix + "_test.log";
    var fuzzLink = prefix + "_fuzzingTest.log";
    var staticLink = prefix + "_staticAnalysis.log";
    var staticLink = prefix + "_staticAnalysis.log";
    var metricsLink = file;
    var temp = fs.readFileSync("logs/" + buildLink, "utf8");
    var branch = temp.indexOf("dev branch") != -1 ? "dev" : "release";
    var buildStatus = temp.indexOf("build successful") != -1 ? "successful" : "failure";
    var temp = fs.readFileSync("logs/" + testLink, "utf8");
    var testStatus = temp.indexOf("tests successful") != -1 ? "successful" : "failure";
    var temp = fs.readFileSync("logs/" + fuzzLink, "utf8");
    var fuzzStatus = temp.indexOf("fuzzing tests successful") != -1 ? "successful" : "failure";
    var temp = fs.readFileSync("logs/" + staticLink, "utf8");
    var staticStatus = temp.indexOf("static analysis successful") != -1 ? "successful" : "failure";
    if (fs.existsSync("logs/" + metricsLink)) {
      var temp = fs.readFileSync("logs/" + metricsLink, "utf8");
      var metricsStatus = temp.indexOf("Custom metrics passed") != -1 ? "successful" : "failure";
    } else {
      var metricsStatus = "successful";
    }
    var testResultFile = fs.readFileSync("logs/" + testLink, "utf8");
    if (testResultFile.indexOf("All files             |") > -1)
      var coverage = testResultFile.substring(testResultFile.indexOf("All files             |") + 24, testResultFile.indexOf("|", testResultFile.indexOf("All files             |") + 24)).trim();
    else
      var coverage = "N/A";
    data.push({
      date: date,
      branch: branch,
      buildStatus: buildStatus,
      testStatus: testStatus,
      fuzzStatus: fuzzStatus,
      staticStatus: staticStatus,
      metricsStatus: metricsStatus,
      buildLink: buildLink,
      testLink: testLink,
      fuzzLink: fuzzLink,
      staticLink: staticLink,
      metricsLink: metricsLink,
      coverage: coverage
    });
  }
  res.render('index', {
    title: 'Build Server',
    data: data
  });
});

//run tests - coverage lesser than 70% will trigger failure
function runTests(testLogPath, branch) {
  fs.appendFileSync(serverLogFilePath, 'Running test script.\n');
  fs.writeFileSync(testLogPath, "Running tests for branch " + branch + " .");
  try {
    child = execSync("./scripts/run_tests.sh", { encoding: "utf8" });
    fs.appendFileSync(testLogPath, '\nOutput in stdout:\n ' + child + "\n");
    var coverage = child.substring(child.indexOf("All files             |") + 24, child.indexOf("|", child.indexOf("All files             |") + 24)).trim();
    if (parseFloat(coverage) < 70) {
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
  fs.appendFileSync(serverLogFilePath, 'Running static analysis script.\n');
  fs.writeFileSync(testLogPath, "Running static analysis for branch " + branch);
  try {
    child = execSync("./scripts/run_static.sh", { encoding: "utf8" });
    fs.appendFileSync(testLogPath, '\nOutput in stdout:\n ' + child + "\n");
    if (child.indexOf("failed") == -1) {
      fs.appendFileSync(testLogPath, branch + ' branch static analysis successful.\n');
      return true;
    } else {
      fs.appendFileSync(testLogPath, branch + ' branch static analysis error.\n');
      return false;
    }
  } catch (error) {
    fs.appendFileSync(testLogPath, '\nexec error: \n' + error + "\n");
    fs.appendFileSync(testLogPath, branch + ' branch static analysis error.\n');
    return false;
  }
}

//calculate custom metrics - max conditions greater than 7 will trigger failure - comment to code ratio 5% intended (http://everything2.com/title/comment-to-code+ratio)
function calculateCustomMetrics(testLogPath, branch) {
  fs.appendFileSync(serverLogFilePath, 'Calculating custom metrics.\n');
  fs.writeFileSync(testLogPath, "Calculating custom metrics for branch " + branch + ". Passing criteria - MaxConditions < 7 && Comment-Code ratio >= 5%.");
  var passed = true;
  var files = fs.readdirSync(srcDirectory);
  for (var file of files) {
    if (!fs.lstatSync(srcDirectory + file).isDirectory()) {
      var metrics = analysis.main(srcDirectory + file);
      fs.appendFileSync(testLogPath, "\n\nMax Conditions for file: " + file + "\n");
      for (var metric in metrics) {
        if (metrics[metric].MaxConditions >= 7)
          passed = false;
        fs.appendFileSync(testLogPath, metrics[metric].FunctionName + ": " + metrics[metric].MaxConditions + "\n");
      }

      var content = fs.readFileSync(srcDirectory + file, "utf8");
      var numLines = content.split("\n").length;
      var comments = extract(content);
      var commentLines = 0;
      for (var comment of comments) {
        commentLines += comment.loc.end.line - comment.loc.start.line + 1;
      }
      var commentRatio = (commentLines / numLines) * 100;
      if (commentRatio < 5)
        passed = false;
      fs.appendFileSync(testLogPath, "\nComment to Code ratio for file: " + file + "\n" + commentRatio);
    }
  }
  if (passed) {
    fs.appendFileSync(testLogPath, "\n\nCustom metrics passed.");
  } else {
    fs.appendFileSync(testLogPath, "\n\nCustom metrics failed.");
  }
  return passed;
}

// reject build and revert
function revertBuild(testLogPath, branch) {
  fs.appendFileSync(serverLogFilePath, 'In revert build.\n');
  fs.appendFileSync(testLogPath, 'Failure: Reverting to previous commit.\n');
  try {
    child = execSync("./scripts/reject_build.sh", { encoding: "utf8" });
    fs.appendFileSync(testLogPath, '\nOutput in stdout:\n ' + child + "\n");
    return true;
  } catch (error) {
    fs.appendFileSync(testLogPath, '\nexec error: \n' + error + "\n");
    fs.appendFileSync(testLogPath, branch + ' branch revert error. Manually fix!\n');
    return false;
  }
}

//called by GitHub WebHook
app.post('/postreceive', function (req, res) {
  var branch = req.body.ref;
  var logPrefix = "logs/" + getCurrentTimeInISO();
  var buildLogPath = logPrefix + "_build.log";
  var testLogPath = logPrefix + "_test.log";
  var fuzzingTestLogPath = logPrefix + "_fuzzingTest.log";
  var staticTestLogPath = logPrefix + "_staticAnalysis.log";
  var customMetricsLogPath = logPrefix + "_customMetrics.log";

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
      fs.appendfilesync(buildLogPath, 'dev branch build error.\n');
      buildResult = false;
    }

    var testResults = true;
    testResults = runTests(testLogPath, "dev") && testResults;
    testResults = runFuzzingTests(fuzzingTestLogPath, "dev") && testResults;
    testResults = runStaticAnalysis(staticTestLogPath, "dev") && testResults;
    testResults = calculateCustomMetrics(customMetricsLogPath, "dev") && testResults;

    if (testResults) {
      fs.appendFileSync(serverLogFilePath, 'All dev branch tests successful.\n');
    } else {
      fs.appendFileSync(serverLogFilePath, 'Some dev branch test failed.\n');
    }

    sendEmail("dev", logPrefix, buildResult, testResults);

    if (!buildResult || !testResults) {
      var revertResults = revertBuild(buildLogPath, "dev");
      if (!revertResults) {
        // error with revert
        fs.appendFileSync(serverLogFilePath, 'ERROR: Revert process failed.\n');
      }
    } else {
      // Push to production
      fs.appendFileSync(buildLogPath, '\nPushing to production.\n');
      child = execSync("./scripts/push_prod_dev.sh");
      fs.appendFileSync(buildLogPath, '\nOutput in stdout:\n ' + child);
      fs.appendFileSync(buildLogPath, 'dev branch pushed to production.\n');
      buildResult = true;
    }

    res.send('dev branch build and test complete. Check logs for results.');
  } else if (branch === "refs/heads/release") {
    var buildResult;
    fs.appendFileSync(buildLogPath, 'Will build release branch.\n');
    try {
      child = execSync("./scripts/build_release.sh");
      fs.appendFileSync(buildLogPath, '\nOutput in stdout:\n ' + child);
      fs.appendFileSync(buildLogPath, 'release branch build successful.\n');
      buildResult = true;
    } catch (error) {
      fs.appendFileSync(serverLogFilePath, 'release branch build failed.\n');
      fs.appendFileSync(buildLogPath, '\nexec error: \n' + error + "\n");
      fs.appendfilesync(buildLogPath, 'release branch build error.\n');
      buildResult = false;
    }

    var testResults = true;
    testResults = runTests(testLogPath, "release") && testResults;
    testResults = runFuzzingTests(fuzzingTestLogPath, "release") && testResults;
    testResults = runStaticAnalysis(staticTestLogPath, "release") && testResults;
    testResults = calculateCustomMetrics(customMetricsLogPath, "release") && testResults;
    if (testResults) {
      fs.appendFileSync(serverLogFilePath, 'All release branch tests successful.\n');
    } else {
      fs.appendFileSync(serverLogFilePath, 'Some release branch test failed.\n');
    }

    sendEmail("release", logPrefix, buildResult, testResults);

    if (!buildResult || !testResults) {
      var revertResults = revertBuild(buildLogPath, "release");
      if (!revertResults) {
        // error with revert
        fs.appendFileSync(serverLogFilePath, 'ERROR: Revert process failed.\n');
      }
    } else {
      // Push to production
      fs.appendFileSync(buildLogPath, '\nPushing to production\n');
      child = execSync("./scripts/push_prod_release.sh");
      fs.appendFileSync(buildLogPath, '\nOutput in stdout:\n ' + child);
      fs.appendFileSync(buildLogPath, 'release branch pushed to production.\n');
      buildResult = true;
    }

    res.send('release branch build and test complete. Check logs for results.');
  } else {
    fs.appendFileSync(serverLogFilePath, "Not in acceptable branch, no build will occur.\n");
    res.send("Not in dev or release branch, no build will occur.");
  }
});

//server will listen on port 3000
app.listen(3000, function () {
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
  var child = exec(execQuery, function (error, stdout, stderr) {
    if (error !== null) {
      fs.appendFileSync(serverLogFilePath, "\n" + stderr);
      fs.appendFileSync(serverLogFilePath, "\nProblem sending email to admins.\n");
    } else {
      fs.appendFileSync(serverLogFilePath, "\n" + stdout);
      fs.appendFileSync(serverLogFilePath, "\nEmail sent to admins.\n");
    }
  })
}
