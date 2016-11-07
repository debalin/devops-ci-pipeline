#!/bin/sh
#kkapoor

echo "Pushing repository to production web server.\n"

cd /home/ubuntu/markdown-js && GIT_WORK_TREE=/home/ubuntu/website-www/ git fetch -f
cd /home/ubuntu/website-www && npm install
