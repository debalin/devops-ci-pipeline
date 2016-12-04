# DevOps Project Milestone M4
This repository holds the fourth milestone build for the DevOps (CSC 591) course at NC State, Fall '16. The specification for this milestone can be found here: https://github.com/CSC-DevOps/Course/blob/master/Project/M4.md.

Our idea for the 4th milestone is to utilize flamegraphs to detect long method chains. 

### Flamegraphs

Flamgeraphs were introduced by Brendan Gregg (github.com/brendangregg/FlameGraph). They are an interactive visualization for stack traces. They can help detect CPU usage, memory leaks, etc. For generating flamegraphs you generally first record stack traces using tools like perf, DTrace, or SystemTap. Then you collapse/fold the stack traces and generate a visualization showing stacked durations of method calls, much like flames. The proportion of the method calls whose top portions are exposed in the flamegraph, give an indication as to which method is hogging the CPU for the most amount of time.

Our idea is to detect long method calls in Node.js applications through flamegraphs. If a long method chain exists, that might create difficulties for the programmer to debug the program if needed. As a rule of thumb, it is not good to have really long method chains. Finding cyclomatic complexity might not always reveal this scenario. But procuring a flamegraph from the execution of the code might easily reveal these long method chains. Specifically a stack visual which is really tall and has a lot of stack components show that there were many function calls in a chained fashion. It's easy to see this in plain sight after the flamegraph has been generated. But we go one step further, and detect long methods by parsing the flamegraph `svg` through a program.  

### Instructions to run

Our flamegraph implementation comes as a package which can be called by any CI pipeline. The code lies in the `buildserver/flame/` directory. For the sake of an example, we have kept `webapp.js` inside the `flame` directory for testing purposes. Here, we will lay down the steps to test our implementation on this `webapp.js`.

1. Run the webapp in the background using `node --perf-basic-prof webapp.js &`. 
2. Start the profiler using `./script.sh`.
3. Go to a browser and request `localhost:9090/short` (ideally, this should complete exactly once while profiler is running).
4. The script creates a `node-flame.svg` file. Rename it to `node-flame-short.svg`.
5. Repeat steps 2-4 by replacing all occurrences of `short` with `long`.
6. Run the svg editor program using `node addIndicator.js`.
7. Open the files `final-short.svg` and `final-long.svg` (created by `addIndicator.js`) in a browser to see stacks above the alert limit with a red background and stacks below with a green background. 

### Explanation

Our `script.sh` performs the following things:

1. Records the stack traces of the Node webapp process through `perf record`for 20 seconds. 
2. Runs `perf script` to work on `perf.data` and filters out certain method calls. 
3. Collapses the stack traces with an utility called `stackcollapse.pl` provided with the Flamegraph repository. 
4. Take the collapsed stack trace and form a flamegraph `svg` using `flamegraph.pl`. 

We have to run the webapp with the option `--perf-basic-prof` for `perf` to capture a detailed stack trace. Otherwise, it ends up catching stack traces with all the function names as `Unknown`. Immediately we run `perf record` and record the stack traces, fold them and create the flamegraph `svg`. Similarly, for comparison, we run the same steps and capture the stack traces for the function execution which would have the long method chain. Then we pass both of these `svg` paths to `addIndicator.js`, which does the following:

1. Parses the `svg` DOM.
2. Finds all elements with the name `rect` (that's how the stack rectangles are represented in the `svg`). 
3. Sorts these elements on their `y` values. 
4. Finds if the array size exceeds a certain pre-defined constant. 
5. If so, it introduces two rectangles, one colored green which covers the stack elements below that size, and another colored red which covers the stack elements above the same. 
5. Otherwise, it just introduces the green rectangle. 
6. It creates two new `svg`s and they can be opened to see the difference. 

This whole step can be further automated if wanted (as possible future work), to have a flamegraph log like our build history log which would hold the modified flamegraphs for every request to the webapp in a list. Developers can then have a look at that list in runtime and see if their deployed change contains long method chains or not. 

### Results

![Normal method calls before addIndicator.js](http://i.imgur.com/43KFWXM.png)

Normal method calls before addIndicator.js

![Long method chains before addIndicator.js](http://i.imgur.com/KXcVY4i.png)

Long method chains before addIndicator.js

![Normal method calls after addIndicator.js](http://i.imgur.com/6o0O3Vv.png)

Normal method calls after addIndicator.js

![Long method chains after addIndicator.js](http://i.imgur.com/8BSh7BO.png)

Long method chains after addIndicator.js


### Screencast

https://www.youtube.com/watch?v=fNkCK1dtZ9s&feature=youtu.be
