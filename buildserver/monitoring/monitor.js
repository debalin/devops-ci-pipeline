var execSync = require('child_process').execSync;
var fs = require('fs');
var path = require('path');
var redis = require('redis');
var client = redis.createClient(6379, process.env.DB_PORT_6379_TCP_ADDR, {});

setInterval(function(){
        var child1 = "";
        var child2 = "";
        var emailContent1 = "";
        var emailContent2 = "";
        var serverLogFilePath = "server.log";

        fs.writeFileSync(serverLogFilePath, "Starting monitoring.");
        child1 = execSync("ps aux | grep webapp.js | grep -v grep | awk '{print $3}'", { encoding: "utf8" });
        child2 = execSync("ps aux | grep webapp.js | grep -v grep | awk '{print $4}'", { encoding: "utf8" });
        child1 = child1 + ":"+ child2;
        fs.appendFileSync(serverLogFilePath, child1);
        client.set("usageKey", child1, function(err,items){
                if(!err){
                        fs.appendFileSync(serverLogFilePath, "Success");
                }
                else{
                        fs.appendFileSync(serverLogFilePath, err);
                }
        });
}, 2000); //end of setInterval
