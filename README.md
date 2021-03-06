# DevOps Project Milestone M1
This repository holds the first milestone build for the DevOps (CSC 591) course at NC State, Fall '16. The specification for this milestone can be found here: https://github.com/CSC-DevOps/Course/blob/milestone1/Project/M1.md.
  
### Build section
- **Capabilities**: 
  - The ability to trigger a build in response to a git commit via a git hook.
    - [Server-side Github Webhook](https://github.com/debalin/devops-ci-pipeline/blob/milestone1/screens/webhook.PNG) (click to see webhook) for the [Complexity project](https://github.com/wddlz/Complexity) calls build server by making a `POST` request at `/postreceive`, passing what branch has had a change pushed to it. Build server ```app.js``` catches this request (through the `express` module) and runs the build script applicable to that branch.<br>
      - ![webhook](https://github.com/debalin/devops-ci-pipeline/blob/milestone1/screens/webhook.PNG?raw=true)
    - [```post-commit```](https://github.com/debalin/devops-ci-pipeline/blob/milestone1/post-commit) client-side hook can also be used to tell the build server to build a branch but this method will force a push on commit which is not a normal or expected function of build servers. 
  - The ability to execute a build job via a script or build manager (e.g., shell, maven), which ensures a clean build each time.
    - Build scripts [```build-dev```](https://github.com/debalin/devops-ci-pipeline/blob/milestone1/buildserver/scripts/build_dev) and [```build-release```](https://github.com/debalin/devops-ci-pipeline/blob/milestone1/buildserver/scripts/build_release) called by express server handles removing old libraries, switching branches, pulling new code, and building that code. The sample Complexity project is a `Node.js` application, so for now we have done a simple npm install to build all dependencies of the project. 
  - The ability to determine failure or success of a build job, and as a result trigger an external event (run post-build task, send email, etc). 
    - We have executed a child process where we run specific shell scripts to build specific branches. That script returns an error if something went wrong in the build. This is used in the `Node.js` buildserver to trigger an email script, which reads the email IDs from a file and sends a build status mail using the `mailutils` module. 
  - The ability to have multiple jobs corresponding to multiple branches in a repository. Specifically, a commit to a branch, release, will trigger a release build job. A commit to a branch, dev, will trigger a dev build job.
    - The Github post-receive webhook sends the branch pushed to, based on the branch sent different build jobs are run from the build server [```app.js```](https://github.com/debalin/devops-ci-pipeline/blob/milestone1/buildserver/app.js) (as long as the branch is an acceptable branch to the build server).
  - The ability to track and display a history of past builds (a simple list works) via http.
    - We create one log file for each build, where we verbosely note down whatever happened in the build process. The build history can be seen [here](http://ec2-54-191-99-255.us-west-2.compute.amazonaws.com:3000/). This is basically a simple GET request to the root directory of the build server. We parse the log files present in the log directory on that request and present it as a list of logs, with date, branch and build status, using a `Jade` template. The log files are click-able. You can click on a log file link to view its contents.  
    
### Workflow diagram

<img src="https://github.com/debalin/devops-ci-pipeline/blob/milestone1/screens/workflow.png" width="700"/>

### Submission
 - Code
   - in buildserver folder
 - Team Member Unity IDs and Contributions
   - ddas4 (Debalin Das)
   - kkapoor (Kunal Kapoor)
   - pmukher (Pratik Mukherjee)
   - izdrosos (Ian Drosos)
 - README.md 
   - this file
 - Screencast
   - [Screencast Link](https://github.com/debalin/devops-ci-pipeline/blob/milestone1/screens/Screencast.mp4)
