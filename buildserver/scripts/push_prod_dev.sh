#!/bin/sh
#kkapoor, ddas4

echo "Pushing repository to canary web server.\n"

cd /home/ubuntu/markdown-js && git checkout -f dev

cd /home/ubuntu/devops-milestone1/buildserver/scripts && cp -r ../monitoring /home/ubuntu/markdown-js

sudo docker stop canary
sudo docker rm canary
sudo docker rmi devops-milestone3-canary
sudo docker build -t devops-milestone3-canary /home/ubuntu/markdown-js/
sudo docker run --link redis:db -p 50100:9090 -d --name canary devops-milestone3-canary -m $1
