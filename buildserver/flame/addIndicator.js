var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;

var parser = new DOMParser();
var short = fs.readFileSync(__dirname + '/node-flame-short.svg').toString();
var long = fs.readFileSync(__dirname + '/node-flame-long.svg').toString();

var shortDoc = parser.parseFromString(short, "image/svg+xml");
var longDoc = parser.parseFromString(long, "image/svg+xml");

var shortArray = [];
var longArray = [];

var alertLimit = 40;

function parseDOM(array, doc, str, filename) {
	var el = doc.getElementsByTagName("rect");
	var canvasWidth = 0;
	var canvasHeight = 0;
	for (var i=0; i < el.length; i++) {
		
		var width = parseInt(el[i].getAttribute("width"));
		if (width > canvasWidth)
			canvasWidth = width;
		
		var y = parseInt(el[i].getAttribute("y"));

		if (y == 0) {
			canvasHeight = parseInt(el[i].getAttribute("height"));
			continue;
		}

		if(!contains(array, y))
			array.push(y);
	}
	sort(array);

	var finalY;
	var lengthGreater;
	if(array.length > alertLimit) {
		finalY = array[alertLimit];
		lengthGreater = true;
	}
	else {
		var diff = alertLimit - array.length;
		finalY = -(20*diff);
		lengthGreater = false;
	}
	console.log("Length > alertLimit: " + lengthGreater + ", line at y = " + finalY);

	canvasWidth += 200;
	var rect = "\n<rect x='0' y='" + finalY + "' width='" + canvasWidth + "' height='3' fill='#ffffff' rx='2' ry='2' />";
	var last = str.indexOf('#background)"  />') + '#background)"  />'.length;
	str = str.substring(0, last) + rect + "\n" + str.substring(last);

	rect = '\n<linearGradient id="alert" y1="0" y2="1" x1="0" x2="0" >';
	rect += '\n<stop stop-color="#ff9b6f" offset="100%" />';
	rect += '\n<stop stop-color="#ffe0b8" offset="0%" />';
	rect += '\n</linearGradient>';
	rect += '<linearGradient id="safe" y1="0" y2="1" x1="0" x2="0" >';
	rect += '\n<stop stop-color="#8cd7a4" offset="100%" />';
	rect += '\n<stop stop-color="#ba9f97" offset="0%" />';
	rect += '\n</linearGradient>';
	last = str.indexOf('</linearGradient>') + '</linearGradient>'.length;
	str = str.substring(0, last) + rect + "\n" + str.substring(last);

	if (!lengthGreater) {
		rect = '\n<rect x="0" y="0" width="1200" height="802" fill="url(#safe)"  />';
		last = str.indexOf('#background)"  />') + '#background)"  />'.length;
		str = str.substring(0, last) + rect + "\n" + str.substring(last);
	}
	else {
		rect = '\n<rect x="0" y="0" width="1200" height="' + (finalY+1) + '" fill="url(#alert)"  />';
		rect += '\n<rect x="0" y="' + finalY + '" width="1200" height="' + (canvasHeight - finalY) + '" fill="url(#safe)"  />';
		last = str.indexOf('#background)"  />') + '#background)"  />'.length;
		str = str.substring(0, last) + rect + "\n" + str.substring(last);
	}

	fs.writeFileSync(__dirname + filename, str);
}

function contains(array, value) {
	for (var i=0; i<array.length; i++)
		if (array[i] == value)
			return true;
	return false;
}

function sort(array) {
	for (var i=0; i<array.length-1; i++) {
		for (var j=i+1; j<array.length; j++) {
			if (array[i] < array[j]) {
				var temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
		}
	}
}

parseDOM(shortArray, shortDoc, short, '/final-short.svg');
parseDOM(longArray, longDoc, long, '/final-long.svg');