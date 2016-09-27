var express = require('express');
var app = express();
var fs = require('fs');  
require('shelljs/global');
var exec = require('child_process').exec;
var child;
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/postreceive', function (req, res) {
  console.log('in postreceive post');
  var branch = req.body.ref;
  console.log(branch);
  if (branch === "refs/heads/dev") {
    child = exec("./scripts/build-dev", function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
        console.error('exec error: ' + error);
        fs.writeFile('buildStatus.txt', "DEV BUILD was unsuccessful", function (err) {
          if(err)
            return cosnole.log("Not able to write the status of the build")
        }); 
        res.send('dev branch build ERROR (check logs)');
      } else {
        console.log('DEV BUILD SUCCESSFUL (DO STUFF)');
        fs.writeFile('buildStatus.txt', "DEV BUILD was successful", function (err) {
          if(err)
            return cosnole.log("Not able to write the status of the build")
        }); 
        res.send('dev branch build SUCCESS (do stuff)');
      }
    });
  } else if (branch === "refs/heads/release") {
    child = exec("./scripts/build-release", function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
        fs.writeFile('buildStatus.txt', "RELEASE BUILD was unsuccessful", function (err) {
          if(err)
            return cosnole.log("Not able to write the status of the build")
        }); 
        res.send('release branch build ERROR (check logs)');
      } else {
        console.log('release BUILD SUCCESSFUL (DO STUFF)');
        fs.writeFile('buildStatus.txt', "RELEASE BUILD was unsuccessful", function (err) {
          if(err)
            return cosnole.log("Not able to write the status of the build")
        }); 
        res.send('release branch build SUCCESS (do stuff)');
      }
    });
  } else {
    console.log("NOT IN ACCEPTABLE BRANCH, NO BUILD");
    res.send("NOT DEV OR RELEASE, NO BUILD");
  }
});

app.get('/dev', function (req, res) {
  console.log('in dev get');
  child = exec("./scripts/build-dev", function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
      console.error('exec error: ' + error);
      fs.writeFile('buildStatus.txt', "DEV BUILD was unsuccessful", function (err) {
          if(err)
            return cosnole.log("Not able to write the status of the build")
      }); 
      res.send('dev branch build ERROR (check logs)');
    } else {
      console.log('dev BUILD SUCCESSFUL (DO STUFF)');
      fs.writeFile('buildStatus.txt', "DEV BUILD was successful", function (err) {
          if(err)
            return cosnole.log("Not able to write the status of the build")
      });
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
      fs.writeFile('buildStatus.txt', "RELEASE BUILD was unsuccessful", function (err) {
          if(err)
            return cosnole.log("Not able to write the status of the build")
      }); 
      res.send('release branch build ERROR (check logs)');
    } else {
      console.log('release BUILD SUCCESSFUL (DO STUFF)');
      fs.writeFile('buildStatus.txt', "RELEASE BUILD was successful", function (err) {
          if(err)
            return cosnole.log("Not able to write the status of the build")
      }); 
      res.send('release branch build SUCCESS (do stuff)');
    }
  });
  res.send('release branch build path from post-commit');
});

app.listen(3000, function () {
  console.log('Buildserver listening on port 3000!');
});

if (exec('sh sendEmail').code == 0){
  console.log("Email was sent successfully with the build status"); 
}
else
{
  console.log("Couldn't send email. Some error occured");
}