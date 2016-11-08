var http = require('http');
var httpProxy = require('http-proxy');
// REDIS
var redis = require('redis')
var client = redis.createClient(6379, '127.0.0.1', {})
var args = process.argv.slice(2);
var PORT = args[0];
PORT = 3456;
var canaryPercent = .33;
var proxy = httpProxy.createProxyServer(options);
var proxy_server = http.createServer(function(req, res) {
    client.get("canaryFlag", function(err, reply) {
        if (reply == 1) {
            console.log("CANARY ENABLED");       
            if (Math.random() <= canaryPercent) {
                console.log("lteq 33% USE canary");
                client.rpoplpush("canary", "canary", function(err, value) {
                    proxy.web(req, res, {target: value});
                console.log("PROXY TO PORT " + value + " USED");
            });
            } else {
                console.log("gt 33% USE servers");
                client.rpoplpush("servers", "servers", function(err, value) {
                    proxy.web(req, res, {target: value});
                console.log("PROXY TO PORT " + value + " USED");
            });
            }        
        } else {
            console.log("CANARY DISABLED: ALWAYS USE servers LIST");
            client.rpoplpush("servers", "servers", function(err, value) {
                proxy.web(req, res, {target: value});
                console.log("PROXY TO PORT " + value + " USED");
            });
        }
    });
});
proxy_server.listen(PORT);
