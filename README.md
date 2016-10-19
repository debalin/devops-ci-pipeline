# DevOps Project Milestone M2
This repository holds the second milestone build for the DevOps (CSC 591) course at NC State, Fall '16. The specification for this milestone can be found here: https://github.com/CSC-DevOps/Course/blob/master/Project/M2.md.

### System under test
* [markdown-js](https://github.com/wddlz/markdown-js), a fork of the open source project https://github.com/evilstreak/markdown-js that processes markdown with javascript.

### Test section
* **Test Suites**: The ability to run unit tests, measure coverage, and report the results.
  * **Built in Tests**: [Test suite](https://github.com/wddlz/markdown-js/tree/master/test) included by markdown-js ran using [run_tests](https://github.com/debalin/devops-ci-pipeline/blob/milestone2/buildserver/scripts/run_tests.sh) script (that calls ```tap ./test/*.t.js```) which includes coverage of the tests executed, results logged. More specifically, this project is using `node_tap` for test suites. `node_tap` already has a method of generating coverage information (by using the `--cov` parameter included in the `package.json` of our `markdown-js` fork) which we have leveraged and thus reported the same in our logs. [Sample log](https://github.com/debalin/devops-ci-pipeline/blob/milestone2/screens/samples/SAMPLE_test.log.txt).

* **Advanced Testing**: Implement one of the following advanced testing techniques: test priorization, test case generation, fuzzing, or flaky test quarantine.
  * **Fuzzer**: [fuzzer.js](https://github.com/debalin/devops-ci-pipeline/blob/milestone2/buildserver/fuzzer.js) ran against the project files and results logged. The fuzzer was inspired from the workshop of fuzzing that we had done in class, and changed accordingly to suit our needs. [Sample log](https://github.com/debalin/devops-ci-pipeline/blob/milestone2/screens/samples/SAMPLE_fuzzingTest.log.txt).

### Analysis section
* **Basic Analysis** The ability to run an existing static analysis tool on the source code (e.g. FindBugs, PMD, CheckStyle, NCover, Lint, etc.), process its results, and report its findings.
  * **Static Analysis**: script [run_static](https://github.com/debalin/devops-ci-pipeline/blob/milestone2/buildserver/scripts/run_static.sh) is run (calls ```grunt static --force --no-color``` and consequently ```grunt jshint```) to execute JSHint and detect lint errors and other potential static code analysis problems on the markdown-js project and logs results. [Sample log](https://github.com/debalin/devops-ci-pipeline/blob/milestone2/screens/samples/SAMPLE_staticAnalysis.log.txt).

* **Custom Metrics**: The ability to implement your own custom source metrics.
   * **Max Conditions**: [analysis.js](https://github.com/debalin/devops-ci-pipeline/blob/milestone2/buildserver/analysis.js) ran against the project files, which was inspired from the workshop that we did in class. It calculates the max number of conditions in a function for every file present in the `src` directory. For our use case, we have kept the passing criteria as 7, i.e. if the maximum number of conditions is found to be below 7, then the custom metric analysis (and hence commit) is considered as failed. [Sample log](https://github.com/debalin/devops-ci-pipeline/blob/milestone2/screens/samples/SAMPLE_customMetrics.log.txt).
   * **Long method**: Long method checking aims to find out methods which exceed a certain number of lines of code. The exact threshold of course depends on the developer and for our use case, we have kept it as 80. We did not need to code this separately as this is already done in JSHint and hence we declared the `maxstatements` property in the `Gruntfile.js` file of our open source fork. This statement will then be evaluated by JSHint when the static code analysis part is run after a commit. If this fails, the failure will be logged in the `static_code_analysis.log` as opposed to the `metrics.log`, accessible through our buildserver UI.
   * **Comment-to-Code ratio**: Comment to code ratio is a metric that we chose to implement as a free style mertic. This calculates the lines of code for each file and then using the `esprima-extract-comments` node module, extracts the comments and the lines spanned by the same. The ratio is consequently calculated and reported. Ideally, this ratio should be somewhere between 5-15%. And for our use case, we have kept the limit as 5%. This (and all other passing criterions) can be modified in `app.js`. 

### Gate section
* If the build process, tests in the test suite/advanced testing fuzzer, or static/custom analysis fail, the Gate triggers the script [reject_build](https://github.com/debalin/devops-ci-pipeline/blob/milestone2/buildserver/scripts/reject_build.sh). This script causes the server to revert the failing commit, pull from the previous (passing) commit, and push the reverted commit into the repo. This push triggers the webhook /postreceive on the server to rebuild the project with the passing commit. The Gate makes sure that only commits that pass a minimum testing criteria remain on the repo and server. We could have also used `git reset` but it's advisable not to use that because it's better to keep the history of what commits were reverted and which ones weren't. Going by that philosophy, we used `git revert` and then `git push` to accomplish this section. 

### View
* Results of the above processes are emailed to developers and are available on the [build server](http://54.191.99.255:3000/) for viewing/download.

### Submission
- Code
  - in buildserver folder (scripts in `scripts` sub-folder)
- Team Member Unity IDs
  - ddas4 (Debalin Das)
  - kkapoor (Kunal Kapoor)
  - pmukher (Pratik Mukherjee)
  - izdrosos (Ian Drosos)
- README.md 
  - this file
- Test cases/scripts/screenshots that demonstrate each capability.
  - See sections above with links to tests/scripts/screens of each capability.
- Screencast
  - https://www.youtube.com/watch?v=JyOOjhT7lQQ
  
### Workflow diagram
 - Milestone 2
  <img src="https://github.com/debalin/devops-ci-pipeline/blob/milestone2/screens/DrawingM2Arch.png" width="700"/>
  
### Previous milestone

We have chosen to build on top of what we had in our first milestone. Details of the first milestone, workflow diagrams, etc. can be found [here](https://github.com/debalin/devops-ci-pipeline/blob/master/README.md).
