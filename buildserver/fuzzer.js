var test = require('tap').test,
    //fuzzer = require('fuzzer'),
    Random = require('random-js')
    markdown = require('markdown').markdown,
    fs = require('fs'),
    //stackTrace = require('stack-trace')
    stackTrace = require('stacktrace-parser')
    ;

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

var fuzzer =
{
    random : new Random(Random.engines.mt19937().seed(0)),

    seed: function (kernel)
    {
        fuzzer.random = new Random(Random.engines.mt19937().seed(kernel));
    },

    mutate:
    {
        string: function(val)
        {
            // MUTATE IMPLEMENTATION HERE
            var array = val.split('');

            while (true)
            {
                // 5% - Reverse
                if( fuzzer.random.bool(0.05) )
                {
                    array.reverse();
                }

                // 25% - Remove random
                if ( fuzzer.random.bool(0.25) )
                {
                    var start = fuzzer.random.integer(0, array.length - 1);
                    var len = fuzzer.random.integer(0, array.length - start);
                    array.splice(start, len);
                }

                // 25% - Insert random
                if ( fuzzer.random.bool(0.25) )
                {
                    var start = fuzzer.random.integer(0, array.length);
                    var len = fuzzer.random.integer(0, array.length);
                    var newstring = fuzzer.random.string(len);
                    array.splice(start, 0, newstring);
                }

                // 5% - Repeat
                if ( fuzzer.random.bool(0.95) )
                {
                    break;
                }
            }

            return array.join('');
        }
    }
};

fuzzer.seed(0);

var failedTests = [];
var reducedTests = [];
var passedTests = 0;

function mutationTesting()
{
    var md = fs.readFileSync('tests/test.md','utf-8');

    for (var i = 0; i < 1000; i++) {
        var mutuatedString = fuzzer.mutate.string(md);
        
        try
        {
            var out = markdown.toHTML(mutuatedString);
            passedTests++;
        }
        catch(e)
        {
            failedTests.push( {input:mutuatedString, stack: e.stack} );
        }
    }

    // > 10% tests failed
    if (failedTests > 100) {
        console.error("Fuzzing test FAILED as more than 10% test cases failed.");
        for( var i =0; i < failedTests.length; i++ )
        {
            var failed = failedTests[i];
            var trace = stackTrace.parse( failed.stack );
            var msg = failed.stack.split("\n")[0];

            var flag = false;
            for ( var j = 0; j < reducedTests.length; j++)
            {
                if ( reducedTests[j] == msg + trace[0].methodName + trace[0].lineNumber)
                {
                    flag = true;
                    break;
                }
            }

            if ( flag == false)
            {
                reducedTests[reducedTests.length] = msg + trace[0].methodName + trace[0].lineNumber;
                console.error( msg, trace[0].methodName, trace[0].lineNumber );
            }
        }
        console.error( "passed {0}, failed {1}, reduced {2}".format(passedTests, failedTests.length, reducedTests.length) );
        throw "Fuzzing test FAILED";
    }

    // RESULTS OF FUZZING
    for( var i =0; i < failedTests.length; i++ )
    {
        var failed = failedTests[i];
        var trace = stackTrace.parse( failed.stack );
        var msg = failed.stack.split("\n")[0];

        var flag = false;
        for ( var j = 0; j < reducedTests.length; j++)
        {
            if ( reducedTests[j] == msg + trace[0].methodName + trace[0].lineNumber)
            {
                flag = true;
                break;
            }
        }

        if ( flag == false)
        {
            reducedTests[reducedTests.length] = msg + trace[0].methodName + trace[0].lineNumber;
            console.log( msg, trace[0].methodName, trace[0].lineNumber );
        }
    }

    console.log( "passed {0}, failed {1}, reduced {2}".format(passedTests, failedTests.length, reducedTests.length) );

}

mutationTesting();

//test('markedMutation', function(t) {
//
//});


