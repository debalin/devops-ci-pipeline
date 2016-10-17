var esprima = require("esprima");
var options = { tokens: true, tolerant: true, loc: true, range: true };
var fs = require("fs");
var imports = 0;

module.exports.main = function main(filePath) {
  complexity(filePath);

  return builders;
}

var builders = {};

// Represent a reusable "class" following the Builder pattern.
function ComplexityBuilder() {
  this.StartLine = 0;
  this.FunctionName = "";
  // The max number of conditions if one decision statement.
  this.MaxConditions = 0; // TODO
  this.report = function() {
    console.log(
      (
        "{0}(): {1}\n" +
        "MaxConditions: {2}\t" + "\n"
      )
      .format(this.FunctionName, this.StartLine,
        this.MaxConditions)
    );
  }
};

// A function following the Visitor pattern. Provide current node to visit and function that is evaluated at each node.
function traverse(object, visitor) {
  var key, child;

  visitor.call(null, object);

  for (key in object) {
    if (object.hasOwnProperty(key)) {
      child = object[key];
      if (typeof child === 'object' && child !== null) {
        traverse(child, visitor);
      }
    }
  }
}

// A function following the Visitor pattern.
// Annotates nodes with parent objects.
function traverseWithParents(object, visitor) {
  var key, child;

  visitor.call(null, object);

  for (key in object) {
    if (object.hasOwnProperty(key)) {
      child = object[key];
      if (typeof child === 'object' && child !== null && key != 'parent') {
        child.parent = object;
        traverseWithParents(child, visitor);
      }
    }
  }
}


// A function following the Visitor pattern but allows canceling transversal if visitor returns false.
function traverseWithCancel(object, visitor) {
  var key, child;

  if (visitor.call(null, object)) {
    for (key in object) {
      if (object.hasOwnProperty(key)) {
        child = object[key];
        if (typeof child === 'object' && child !== null) {
          traverseWithCancel(child, visitor);
        }
      }
    }
  }
}

function complexity(filePath) {
  var buf = fs.readFileSync(filePath, "utf8");
  var ast = esprima.parse(buf, options);

  var i = 0;
  // Tranverse program with a function visitor.
  traverseWithParents(ast, function(node) {
    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
      var builder = new ComplexityBuilder();

      builder.FunctionName = functionName(node);
      builder.StartLine = node.loc.start.line;
      builder.MaxConditions = getMaxConditions(node);
      builders[builder.FunctionName] = builder;
    }

  });

}

// Helper function for counting children of node.
function childrenLength(node) {
  var key, child;
  var count = 0;
  for (key in node) {
    if (node.hasOwnProperty(key)) {
      child = node[key];
      if (typeof child === 'object' && child !== null && key != 'parent') {
        count++;
      }
    }
  }
  return count;
}


// Helper function for checking if a node is a "decision type node"
function isDecision(node) {
  if (node.type == 'IfStatement') {
    // Don't double count else/else if
    if (node.parent && node.parent.type == 'IfStatement' && node.parent["alternate"]) {
      return false;
    }
    return true;
  }

  if (node.type == 'ForStatement' || node.type == 'WhileStatement' ||
    node.type == 'ForInStatement' || node.type == 'DoWhileStatement') {
    return true;
  }
  return false;
}

// Helper function for printing out function name.
function functionName(node) {
  if (node.id) {
    return node.id.name;
  }
  return "anon function @" + node.loc.start.line;
}

// Helper function for allowing parameterized formatting of strings.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}

// added code
// Helper function for printing out parameter count.
function getParameters(node) {
  var paramCount = 0;
  if (node.params != null) {
    paramCount = node.params.length;
  }

  return paramCount;
}

// Helper function to get SimpleCyclomaticComplexity
function getCyclomaticComplexity(node) {
  var complexityCount = 1;
  traverseWithParents(node, function(n) {
    if (isDecision(n)) {
      complexityCount++;
    }
  });
  return complexityCount;
}

// Helper function for checking if a node is a "decision type node"
// Does not ignore else ifs so it can count the max conditions of a decision statement
function isDecisionConditional(node) {
  if (node.type == 'IfStatement' || node.type == 'ForStatement' || node.type == 'WhileStatement' ||
    node.type == 'ForInStatement' || node.type == 'DoWhileStatement') {
    return true;
  }
  return false;
}

// Helper function to get max conditions 
function getMaxConditions(node) {
  var condiCount = 1;
  var maxCondiCount = 1; // decisions require 1 conditional at least
  traverseWithParents(node, function(n) {
    // 1st count entry into a decision and then add each logical expression after it,
    // if a new decision is reached then reset counter to 1 and start chain again.
    if (isDecisionConditional(n)) {
      if (maxCondiCount < condiCount) {
        maxCondiCount = condiCount;
      }
      condiCount = 1;
    }
    if (n.type == 'LogicalExpression') {
      condiCount++;
    }
  });

  if (maxCondiCount < condiCount) {
    maxCondiCount = condiCount;
    // console.log('NEW MAX: ' + maxCondiCount);
  }
  return maxCondiCount;
}
