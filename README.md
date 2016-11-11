# DevOps Project Milestone M3
This repository holds the third milestone build for the DevOps (CSC 591) course at NC State, Fall '16. The specification for this milestone can be found here: https://github.com/CSC-DevOps/Course/blob/master/Project/M3.md.

### Properties

Your production infrastructure and deployment pipeline should support the following properties.

- [x] The ability to deploy software to the production environment triggered *after* build, testing, and analysis stage is completed. The deployment needs to occur on actual remote machine/VM (e.g. AWS, droplet, VCL), and not a local VM.
  - The build server checks if the build has succeeded or failed. If it fails it sends an email to the users as before but does not deploy the software to production. Only when the build is complete and successful is it deployed to production or canary, depending on which branch has been pushed to.
  - Deployment to production is done by calling its shell script. This script spawns a docker container with the updated files of the application, installs the dependencies and then runs the web application.
  - Deployment is done to the production server for release branch updates and to the canary server for dev branch updates. This is because of how we have implemented the next set of features of the server.
  - The build server can be accessed at [http://54.191.99.255:3000](http://54.191.99.255:3000) which shows whether the build was successful or not.
  - The production server can be accessed at [http://54.191.99.255:50000](http://54.191.99.255:50000) which runs the webapp present there.
  - The canary server can be accessed at [http://54.191.99.255:50100](http://54.191.99.255:50100) which runs the webapp present there.

- [x] The ability to configure a production environment *automatically*, including all infrastructure components, such web server, app service, load balancers, and redis stores. Configure should be accopmlished by using a configuration management tool, such as ansible, or docker. Alternatively, a cluster management approach could also work (e.g., kubernates).
  - Our production environment is maintained in Docker containers. So their configuration is maintained through Dockerfiles. You can see our main Dockerfile [here](https://github.com/wddlz/markdown-js/blob/dev/Dockerfile). It sets up the environment by taking `node:argon` as the base image and then doing npm install for **both** our application and the monitoring `Node` file. Both of them are run through a shell script which acts as an entrypoint in the Dockerfile. 

- [x] The ability to monitor the deployed application (using at least 2 metrics) and send alerts using email or SMS (e.g., smtp, mandrill, twilio). An alert can be sent based on some predefined rule.
  - For monitoring the usage of the application, a `Node` file called `monitor.js` was written which would monitor the `webapp.js` every 2 seconds through the setinterval function and would extract the memory and CPU utilization values by using the follwing two commands:
  ```
    ps aux | grep webapp.js | grep -v grep | awk '{print $3}' 
    ps aux | grep webapp.js | grep -v grep | awk '{print $4}'
  ```    
These two values were concatenated separated by a ":". The concatenated value was assighed to a key and the value of the key was deployed on a redis server in a docker container. The app.js was modified to monitor the redis server in the docker container. It would get the values of the key from the container every 30 seconds. It would parse the value of the key and extract the values of the CPU and memory usage. After extraction it would compare the values with threshold utilization values. If the usage values is greater than the utilization values, it would trigger an email and send them to admins. 

- [x] The ability to autoscale individual components of production and maintain and track in a central discovery service. Autoscale can be triggered by a predefined rule.
  - The monitoring application above constantly monitors the memory usage of the web application running inside the docker container. The monitoring program sets the ```usageKey``` flag in redis to signal the memory usage to the main deployment server.
  - The docker container is initally started with a memory limit of 64MB. The deployment server constantly checks the ```usageKey``` redis flag to detect high memory usage within the container. If high memory usage is detected, the docker container is re-created with double the current memory limit in order to meet the application demands.
  - An email is sent to the admins regarding this high memory usage situation as well.

- [x] The ability to use feature flags, serviced by a global redis store, to toggle functionality of a deployed feature in production.
  - Feature flags are stored in a redis database that can be called by the deployed app to control access to features. For example, in [webapp.js](https://github.com/wddlz/markdown-js/blob/dev/webapp.js) a ```featureFlag``` is stored in the redis database and controls access to a function that allows you to set a message in the database. When ```featureFlag == 1``` a user can set a message to a string of their choosing, else a message is shown saying the feature is disabled. These flags can be toggeled in the redis database. <br/>
  ![functionscreen](http://i.imgur.com/eyZlg7j.png)

- [x] The ability to perform a canary release: Using a proxy/load balancer server, route a percentage of traffic to a newly staged version of software and remaining traffic to a stable version of software. Stop routing traffic to canary if alert is raised.
  - [proxy.js](https://github.com/debalin/devops-ci-pipeline/blob/milestone3/buildserver/proxy.js) facilitates canary releasing. Whenever it is determined that a specific deployment should undergo a canary release it's url is added to the ```canary``` list. Whenever ```canaryFlag == 1```, enabling canary routing, the proxy server will route servers to both production servers, stored in the ```servers``` list, and the ```canary``` list servers. The proxy server routes 33% of traffic to the canary servers, and the rest are sent to the normal production list of servers. If the canary flag is disabled then all traffic is routed to the production servers. The proxy server can be accessed at http://54.191.99.255:3456/.

### Submission

- Code
  - in buildserver folder (scripts in `scripts` sub-folder)
  - in [markdown-js repo](https://github.com/wddlz/markdown-js/tree/dev) (feature flags usage, etc)
- Team Member Unity IDs
  - ddas4 (Debalin Das)
  - kkapoor (Kunal Kapoor)
  - pmukher (Pratik Mukherjee)
  - izdrosos (Ian Drosos)
- README.md 
  - this file
- Screencast
  - describing how your component meets each property.

Due Thursday, Nov 10th @ midnight.
  
### Workflow diagram
 - Milestone 3<br/><br/>
 <img src="https://github.com/debalin/devops-ci-pipeline/raw/milestone3/screens/DrawingM3Arch.png" width="700"/>
 
### Previous milestone
We have chosen to build on top of what we had in our first and second milestone. Details of the milestones, workflow diagrams, etc. can be found [here](https://github.com/debalin/devops-ci-pipeline/blob/master/README.md) and [here](https://github.com/debalin/devops-ci-pipeline/tree/milestone2).
