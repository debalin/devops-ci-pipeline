#!/bin/sh
#kkapoor, ddas4

echo "Pushing repository to production web server.\n"
cp -r ../monitoring /home/ubuntu/markdown-js
sudo docker stop production
sudo docker rm production
sudo docker rmi devops-milestone3-prod
sudo docker build -t devops-milestone3-prod /home/ubuntu/markdown-js/
sudo docker run --link redis:db -p 50000:9090 -d --name production devops-milestone3-prod -m $1
