var express = require('express');
var fs = require('fs');
var app = express();
// REDIS
var redis = require('redis');
var client = redis.createClient();

var args = process.argv.slice(2);
var PORT = args[0];
PORT = 9090;

// Root page
app.get('/', function (req, res) {
  var message = "Hello World from Canary!";
  res.send(message);
});

app.get('/get', function (req, res) {
  client.get("selfdestruct", function (err, value) {
    console.log(value);
    res.send(value);
  });
});

app.get('/set', function (req, res) {
  var message = "this message will self destruct in 10 seconds";
  // if (err) throw err
  // res.writeHead(200, {'content-type':'text/html'});
  client.set("selfdestruct", message);
  client.expire("selfdestruct", 10);
  client.get("selfdestruct", function (err, value) {
    res.send("KEY selfdestruct SET TO " + value);
  })
});

var server = app.listen(PORT, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
});

app.get('/long', function (req, res) {
    StartOfLongFunction();
    res.send("Long function completed");  
});

app.get('/short', function (req, res) {
	for(var i=1; i<50; i++);
    StartOfShortFunction();
    res.send("Short function completed");
});

function StartOfLongFunction(){ 
	var time = new Date().getTime();
	for (var j = 0; j < 10000; j++) {
		b = 1;
	   	for (var i = 0; i < 10000; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside Long: " + time); 
    B();
}

function B(){ 
	var time = new Date().getTime();
	for (var j = 0; j < 10000; j++) {
		b = 1;
	   	for (var i = 0; i < 9500; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside B: " + time); 
    C();
}

function C(){ 
	var time = new Date().getTime();
	for (var j = 0; j < 10000; j++) {
		b = 1;
	   	for (var i = 0; i < 9000; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside C: " + time); 
    D(); 
}

function D(){ 
	var time = new Date().getTime();
	for (var j = 0; j < 10000; j++) {
		b = 1;
	   	for (var i = 0; i < 8500; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside D: " + time); 
    E();
}

function E(){ 
	var time = new Date().getTime();
	for (var j = 0; j < 10000; j++) {
		b = 1;
	   	for (var i = 0; i < 8000; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside E: " + time); 
    F(); 
}

function F(){ 
	var time = new Date().getTime();
	for (var j = 0; j < 10000; j++) {
		b = 1;
	   	for (var i = 0; i < 7500; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside F: " + time); 
    G(); 
}

function G(){ 
	var time = new Date().getTime();
	for (var j = 0; j < 10000; j++) {
		b = 1;
	   	for (var i = 0; i < 7000; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside G: " + time); 
    H(); 
}

function H(){ 
	var time = new Date().getTime();
	for (var j = 0; j < 10000; j++) {
		b = 1;
	   	for (var i = 0; i < 6500; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside H: " + time); 
    I(); 
}

function I(){ 
	var time = new Date().getTime();
	for (var j = 0; j < 10000; j++) {
		b = 1;
	   	for (var i = 0; i < 6000; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside I: " + time); 
    J(); 
}

function J(){ 
	var time = new Date().getTime();
	for (var j = 0; j < 10000; j++) {
		b = 1;
	   	for (var i = 0; i < 5500; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside J: " + time); 
    K(); 
}

function K(){ 
	var time = new Date().getTime();
	for (var j = 0; j < 10000; j++) {
		b = 1;
	   	for (var i = 0; i < 5000; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside K: " + time); 
    L(); 
}

function L(){ 
	var time = new Date().getTime();
	for (var j = 0; j < 10000; j++) {
		b = 1;
	   	for (var i = 0; i < 4500; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside L: " + time); 
    M(); 
}

function M(){ 
	var time = new Date().getTime();
	for (var j = 0; j < 10000; j++) {
		b = 1;
	   	for (var i = 0; i < 4000; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside M: " + time); 
}

function N(b) {
	b = b + b * 34;
	b = b + Math.sqrt(b);
	return b;
}

function StartOfShortFunction() {
	var time = new Date().getTime();
	for (var j = 0; j < 30000; j++) {
		b = 1;
	   	for (var i = 0; i < 30000; i++) {
	   		b = N(b);
	   	}
	}
	time = new Date().getTime() - time;

    console.log("Inside Short: " + time); 
}