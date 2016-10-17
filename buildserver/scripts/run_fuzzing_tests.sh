#!/bin/sh
# MAKE SURE TO CHMOD 0755 THESE SO SERVER CAN EXECUTE THEM
# fuzzing script to run on required branch
# kunal kapoor

echo "Running fuzzing test script.\n"
npm install /home/ubuntu/markdown-js > /dev/null 2>&1
node fuzzer.js
