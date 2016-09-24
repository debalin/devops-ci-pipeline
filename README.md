# devops-milestone1
This repository holds the first milestone build for the DevOps (CSC 591) course at NC State, Fall '16. 

### Build section
- **Capabilities**: 
  - The ability to trigger a build in response to a git commit via a git hook.
    - [Server-side Github Webhook](https://raw.githubusercontent.com/debalin/devops-milestone1/master/screens/webhook.PNG?token=ANOsKlsFZ5lwrtu24P9-xdoPYMozdPsRks5X8Ci0wA%3D%3D) calls build server /postreceive express hook, passing what branch has had a change pushed to it. Build server ```app.js``` catches this request and runs the build script applicable to that branch.
    - ![altcode](https://raw.githubusercontent.com/debalin/devops-milestone1/master/screens/webhook.PNG?token=ANOsKlsFZ5lwrtu24P9-xdoPYMozdPsRks5X8Ci0wA%3D%3D)
    - [```post-commit```](https://github.com/debalin/devops-milestone1/blob/master/post-commit) client-side hook can also be used to tell the build server to build a branch but this method will force a push on commit which is not a normal or expected function of git commits. 
  - The ability to execute a build job via a script or build manager (e.g., shell, maven), which ensures a clean build each time.
    - Build scripts [```build-dev```](https://github.com/debalin/devops-milestone1/blob/master/buildserver/scripts/build-dev) and [```build-release```](https://github.com/debalin/devops-milestone1/blob/master/buildserver/scripts/build-release) called by express server handles removing old libraries, switching branches, pulling new code, and building that code.
  - The ability to determine failure or success of a build job, and as a result trigger an external event (run post-build task, send email, etc).
  - The ability to have multiple jobs corresponding to multiple branches in a repository. Specifically, a commit to a branch, release, will trigger a release build job. A commit to a branch, dev, will trigger a dev build job.
    - The Github post-receive webhook sends the branch pushed to, based on the branch sent different build jobs are run (as long as the branch is an acceptable branch to the build server)
  - The ability to track and display a history of past builds (a simple list works) via http.
  
### Evaluation 
- Triggered Builds - 20%
- Dependency Management + Build Script Execution - 20%
- Build Status + External Post-Build Job Triggers - 20%
- Multiple Branches, Multiple Jobs - 20%
- Build History and Display over HTTP - 20%

### Submission
- Code
  - in buildserver folder
- Unity IDs
  - ddas4 (Debalin Das)
  - kkapoor (Kunal Kapoor)
  - pmukher (Pratik Mukherjee)
  - izdrosos (Ian Drosos)
- README.md 
  - this file
- screencast
  - LINK GOES HERE
