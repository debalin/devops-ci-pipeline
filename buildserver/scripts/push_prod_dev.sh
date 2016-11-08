#!/bin/sh
#kkapoor, ddas4

echo "Pushing repository to production web server.\n"

sudo docker stop app
sudo docker rm app
sudo docker rmi devops-milestone3
sudo docker build -t devops-milestone3 /home/ubuntu/markdown-js/
sudo docker run --link redis:db -p 50100:9090 -d --name app devops-milestone3