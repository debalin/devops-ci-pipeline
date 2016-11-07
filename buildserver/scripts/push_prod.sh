#!/bin/sh
#kkapoor

echo "Pushing repository to production web server.\n"

forever stop /home/ubuntu/website-www/webapp.js
cd /home/ubuntu/markdown-js && GIT_WORK_TREE=/home/ubuntu/website-www/ git fetch -f
cd /home/ubuntu/website-www && npm install
forever start /home/ubuntu/website-www/webapp.js
