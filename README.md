# DevOps Project Milestone M3
This repository holds the third milestone build for the DevOps (CSC 591) course at NC State, Fall '16. The specification for this milestone can be found here: https://github.com/CSC-DevOps/Course/blob/master/Project/M3.md.

### Properties

Your production infrastructure and deployment pipeline should support the following properties.

- [x] The ability to deploy software to the production environment triggered *after* build, testing, and analysis stage is completed. The deployment needs to occur on actual remote machine/VM (e.g. AWS, droplet, VCL), and not a local VM.

- [x] The ability to configure a production environment *automatically*, including all infrastructure components, such web server, app service, load balancers, and redis stores. Configure should be accopmlished by using a configuration management tool, such as ansible, or docker. Alternatively, a cluster management approach could also work (e.g., kubernates).

- [x] The ability to monitor the deployed application (using at least 2 metrics) and send alerts using email or SMS (e.g., smtp, mandrill, twilio). An alert can be sent based on some predefined rule.

- [x] The ability to autoscale individual components of production and maintain and track in a central discovery service. Autoscale can be triggered by a predefined rule.

- [x] The ability to use feature flags, serviced by a global redis store, to toggle functionality of a deployed feature in production.
  - Feature flags are stored in a redis database that can be called by the deployed app to control access to features. For example, in [webapp.js](https://github.com/wddlz/markdown-js/blob/dev/webapp.js) a ```setMessageFlag``` is stored in the redis database and controls access to a function that allows you to set a message in the database. When ```setMesageFlag == 1``` a user can set a message to a string of their choosing, else a message is shown saying the feature is disabled. These flags can be toggeled in the redis database.
  - ![functionscreen](https://github.com/debalin/devops-ci-pipeline/raw/milestone3/screens/functionFlag.PNG)

- [x] The ability to perform a canary release: Using a proxy/load balancer server, route a percentage of traffic to a newly staged version of software and remaining traffic to a stable version of software. Stop routing traffic to canary if alert is raised.
  - [proxy.js](https://github.com/debalin/devops-ci-pipeline/blob/milestone3/buildserver/proxy.js) facilitates canary releasing. Whenever it is determined that a specific deployment should undergo a canary release it's url is added to the ```canary``` list. Whenever ```canaryFlag == 1```, enabling canary routing, the proxy server will route servers to both production servers, stored in the ```servers``` list, and the ```canary``` list servers. The proxy server routes 33% of traffic to the canary servers, and the rest are sent to the normal production list of servers. If the canary flag is disabled then all traffic is routed to the production servers.

### Evalution

* Triggered, remote deployment: 15%
* Automatic configuration of production environment: 15%
* Metrics and alerts: 15%
* Autoscaling 15%
* Feature Flags: 20%
* Canary releasing: 20%

### Submission

[Submit here](https://goo.gl/forms/T0S379BageCgUYir2), a link to your repo that includes

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
